import express from "express";
import upload from '../middleware/uploadImage.js';

import { 
  signup, 
  login, 
  logout,
  getUserProfile,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  getUserById,
  getUserByFirebaseUid,
  // getUsers,              
  searchUsers            
} from "../controllers/userController.js";
import { verifyFirebaseToken, updateProfilePicture } from "../controllers/authController.js";
import {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  findProductById,
  findProductByName,
} from "../controllers/productController.js";

import { 
  createTransaction, 
  getMyTransactions, 
  getTransactionById, 
  updateTransactionStatus,
  handleMidtransWebhook
} from "../controllers/transactionController.js";

import ChatController from "../controllers/chatController.js";
// import { verifyFirebaseToken } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { getMidtransStatus } from "../controllers/transactionController.js";

const router = express.Router();

// ============================== AUTH ROUTES =======================
router.post("/verify-token", verifyFirebaseToken); // Endpoint baru untuk verifikasi token Firebase

// ============================== USER ROUTES =======================
router.get("/me-profile", authenticateToken, getUserProfile);
router.put("/me-profile", authenticateToken, updateUserProfile);         // Route untuk update profile pribadi
router.post("/update-profile-picture", authenticateToken, upload.single('image'), updateProfilePicture); 
router.post("/logout", authenticateToken, logout);
// Route untuk update foto profil
router.get("/user/:userId", authenticateToken, getUserById);                 // Route untuk get profile user lain
// router.get("/users", authenticateToken, getUsers);                          // Route untuk get all users (admin only)
router.get("/search-users", authenticateToken, searchUsers);                // Route untuk search users
router.get("/user/firebase/:firebase_uid", authenticateToken, getUserByFirebaseUid);


router.post("/signup", signup); // Untuk backward compatibility
router.post("/login", login); // Untuk backward compatibility

router.post("/change-password", authenticateToken, changePassword);      // Route untuk change password
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);


// =================== Product routes ===================
router.get("/products", getAllProducts);                           // Route untuk get all products
router.post("/add-product",authenticateToken, upload.single('image'),addProduct);        // Route untuk add product (requires authentication)
router.get("/product/:product_id", findProductById);
router.put("/product/:product_id", authenticateToken, upload.single("image"),updateProduct);                 // Route untuk update product
router.delete("/product/:product_id", authenticateToken, deleteProduct);              // Route untuk delete product (soft delete)
router.get("/product/search/:name", findProductByName);

// =================== Transaction routes ===================
router.post("/create-transaction", authenticateToken, createTransaction);
router.get("/my-transactions", authenticateToken, getMyTransactions);
router.get("/transaction/:id", authenticateToken, getTransactionById);
router.put("/transaction/:id/status", authenticateToken, updateTransactionStatus);
router.post("/midtrans-webhook", handleMidtransWebhook); // Endpoint untuk menerima webhook dari Midtrans

// =================== Chat routes ===================
router.post("/chat", authenticateToken, ChatController.startChat);
router.get("/chat/conversations", authenticateToken, ChatController.getUserConversations);
router.get("/chat/conversation/:user_id", authenticateToken, ChatController.getConversation);
router.put("/chat/:chat_id/status", authenticateToken, ChatController.updateMessageStatus);
router.delete("/chat/:chat_id", authenticateToken, ChatController.deleteMessage);

router.get('/midtrans/status/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const status = await getMidtransStatus(orderId);
    return res.status(200).json({
      status: 200,
      message: 'Transaction status retrieved successfully',
      data: status
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve transaction status',
      error: error.response?.data || error.message
    });
  }
});


export default router;
