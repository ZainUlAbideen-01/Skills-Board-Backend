import { Router } from 'express';
import {
createListing ,
getListingById,
updateListing,
deleteListing,
getMyListings,
searchListings
} from '../controllers/listing.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createListing);


router.get('/mine', protect, getMyListings);
router.get('/search', protect, searchListings);


router.get('/:id', protect, getListingById);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

export default router;
 






