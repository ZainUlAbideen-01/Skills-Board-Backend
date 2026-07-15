import { Server, Socket } from 'socket.io';
import http from 'http';
import { verifyToken } from '../utils/jwt';
import redisClient from './redis';
import Message from '../models/Message';
import Block from '../models/Block';
import mongoose from 'mongoose';

const onlineUsers = new Map<string, string>();

export const initSocket = (httpServer: http.Server): Server => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // frontend URL in production
            methods: ['GET', 'POST'],
        },
    });

    // Auth middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token as string;
            if (!token) {
                return next(new Error('UNAUTHENTICATED'));
            }

            const isBlacklisted = await redisClient.get(`blacklist:${token}`);
            if (isBlacklisted) {
                return next(new Error('UNAUTHENTICATED'));
            }

            const decoded = verifyToken(token);
            socket.data.userId = decoded.id;
            next();
        } catch {
            next(new Error('UNAUTHENTICATED'));
        }
    });

    // Connection
    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId as string;
        onlineUsers.set(userId, socket.id);

        socket.broadcast.emit('user_online', { userId });

        // send_message
        socket.on(
            'send_message',
            async (
                payload: { receiverId: string; content: string; listingId?: string },
                callback: (response: { success: boolean; data?: object; error?: string }) => void
            ) => {
                try {
                    const { receiverId, content, listingId } = payload;

                    if (!receiverId || !content) {
                        return callback({ success: false, error: 'receiverId and content are required.' });
                    }
                    if (content.length > 2000) {
                        return callback({ success: false, error: 'content must be 2000 characters or fewer.' });
                    }
                    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
                        return callback({ success: false, error: 'Invalid receiverId.' });
                    }

                    const senderObjId = new mongoose.Types.ObjectId(userId);
                    const receiverObjId = new mongoose.Types.ObjectId(receiverId);

                    if (senderObjId.equals(receiverObjId)) {
                        return callback({ success: false, error: 'You cannot message yourself.' });
                    }

                    const block = await Block.findOne({
                        $or: [
                            { blockerId: receiverObjId, blockedId: senderObjId },
                            { blockerId: senderObjId, blockedId: receiverObjId },
                        ],
                    });
                    if (block) {
                        return callback({ success: false, error: 'You cannot message this user.' });
                    }

                    const message = await Message.create({
                        senderId: senderObjId,
                        receiverId: receiverObjId,
                        listingId: listingId && mongoose.Types.ObjectId.isValid(listingId)
                            ? new mongoose.Types.ObjectId(listingId)
                            : undefined,
                        content,
                        read: false,
                        timestamp: new Date(),
                    });

                    const messageData = {
                        _id: message._id,
                        senderId: message.senderId,
                        receiverId: message.receiverId,
                        listingId: message.listingId,
                        content: message.content,
                        read: message.read,
                        timestamp: message.timestamp,
                    };

                    const receiverSocketId = onlineUsers.get(receiverId);
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit('receive_message', messageData);
                    }

                    callback({ success: true, data: messageData });
                } catch (err) {
                    console.error('send_message error:', err);
                    callback({ success: false, error: 'Something went wrong.' });
                }
            }
        );

        // typing_start
        socket.on('typing_start', (payload: { receiverId: string }) => {
            const receiverSocketId = onlineUsers.get(payload.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing_start', { senderId: userId });
            }
        });

        // typing_stop
        socket.on('typing_stop', (payload: { receiverId: string }) => {
            const receiverSocketId = onlineUsers.get(payload.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing_stop', { senderId: userId });
            }
        });

        // mark_read
        socket.on(
            'mark_read',
            async (
                payload: { senderId: string },
                callback: (response: { success: boolean }) => void
            ) => {
                try {
                    await Message.updateMany(
                        {
                            senderId: new mongoose.Types.ObjectId(payload.senderId),
                            receiverId: new mongoose.Types.ObjectId(userId),
                            read: false,
                        },
                        { $set: { read: true } }
                    );

                    const senderSocketId = onlineUsers.get(payload.senderId);
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('messages_read', { by: userId });
                    }

                    callback({ success: true });
                } catch (err) {
                    console.error('mark_read error:', err);
                    callback({ success: false });
                }
            }
        );

        // disconnect
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            socket.broadcast.emit('user_offline', { userId });
        });
    });

    return io;
};