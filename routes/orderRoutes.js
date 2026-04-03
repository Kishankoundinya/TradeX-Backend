const express = require('express');
const router = express.Router();
const { userAuth } = require('../Middleware/userAuth');
const { userModel } = require('../Model/userModel');

// Test endpoint to verify authentication
router.get('/test-user', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Test endpoint called by user:', userId);
        
        const user = await userModel.findById(userId);
        
        res.json({
            success: true,
            message: 'Authentication working',
            userId: userId,
            userEmail: user?.email,
            userBalance: user?.currentBalance
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Place order endpoint
router.post('/place-order', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('=== PLACE ORDER ===');
        console.log('User ID from token:', userId);
        
        const { symbol, companyName, quantity, orderType, price, total } = req.body;
        console.log('Order details:', { symbol, quantity, price, total });

        // Find user by ID from token
        const user = await userModel.findById(userId);
        
        if (!user) {
            console.log('❌ User NOT found with ID:', userId);
            return res.status(404).json({ 
                success: false, 
                message: `User not found with ID: ${userId}` 
            });
        }

        console.log('✅ User found:', user.email);
        console.log('Current balance before order:', user.currentBalance);

        // Check if user has sufficient balance
        if (user.currentBalance < total) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient balance',
                currentBalance: user.currentBalance,
                requiredAmount: total
            });
        }

        // Create stock transaction object
        const stockTransaction = {
            stockName: symbol,
            buyingPrice: price,
            buyingQuantity: quantity,
            buyingDate: new Date(),
            sellingDate: null,
            sellingPrice: null
        };

        // Initialize stockTransactions array if it doesn't exist
        if (!user.stockTransactions) {
            user.stockTransactions = [];
        }

        // Add transaction to user's stockTransactions array
        user.stockTransactions.push(stockTransaction);
        console.log('Transaction added. Total transactions now:', user.stockTransactions.length);
        
        // Deduct from current balance
        user.currentBalance -= total;

        // Save to database
        await user.save();
        
        console.log('✅ Order saved successfully for user:', user.email);
        console.log('New balance:', user.currentBalance);

        res.status(200).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                transaction: stockTransaction,
                newBalance: user.currentBalance,
                totalInvested: total
            }
        });

    } catch (error) {
        console.error('❌ Error placing order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Get user's holdings (grouped by stock with totals)
router.get('/holdings', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('=== FETCHING HOLDINGS ===');
        console.log('User ID:', userId);
        
        const user = await userModel.findById(userId);
        
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        console.log('User found:', user.email);
        console.log('Current balance:', user.currentBalance);
        console.log('Total transactions found:', user.stockTransactions?.length || 0);

        // Filter only active holdings (not sold)
        const activeHoldings = (user.stockTransactions || []).filter(
            transaction => transaction.sellingDate === null
        );

        console.log('Active holdings count:', activeHoldings.length);

        // Group holdings by stock name
        const holdingsMap = new Map();
        
        activeHoldings.forEach(transaction => {
            const stockName = transaction.stockName;
            if (holdingsMap.has(stockName)) {
                const existing = holdingsMap.get(stockName);
                const totalQuantity = existing.quantity + transaction.buyingQuantity;
                const totalCost = existing.totalCost + (transaction.buyingPrice * transaction.buyingQuantity);
                holdingsMap.set(stockName, {
                    stockName: stockName,
                    quantity: totalQuantity,
                    totalCost: totalCost,
                    avgPrice: totalCost / totalQuantity
                });
            } else {
                holdingsMap.set(stockName, {
                    stockName: stockName,
                    quantity: transaction.buyingQuantity,
                    totalCost: transaction.buyingPrice * transaction.buyingQuantity,
                    avgPrice: transaction.buyingPrice
                });
            }
        });

        const holdings = Array.from(holdingsMap.values());
        console.log('Processed holdings count:', holdings.length);

        res.status(200).json({
            success: true,
            data: {
                holdings: holdings,
                currentBalance: user.currentBalance
            }
        });

    } catch (error) {
        console.error('Error fetching holdings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
});

// Sell stock endpoint
router.post('/sell-stock', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('=== SELL STOCK ===');
        console.log('User ID:', userId);
        
        const { transactionId, sellingPrice, quantity } = req.body;

        if (!transactionId || !sellingPrice || !quantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        console.log('User found:', user.email);

        // Find the transaction
        const transaction = user.stockTransactions.id(transactionId);
        
        if (!transaction) {
            return res.status(404).json({ 
                success: false, 
                message: 'Transaction not found' 
            });
        }

        // Check if already sold
        if (transaction.sellingDate !== null) {
            return res.status(400).json({ 
                success: false, 
                message: 'Stock already sold' 
            });
        }

        // Check if selling quantity is valid
        if (quantity > transaction.buyingQuantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot sell more than purchased quantity' 
            });
        }

        const totalSellingAmount = sellingPrice * quantity;
        
        // Update transaction
        transaction.sellingDate = new Date();
        transaction.sellingPrice = sellingPrice;
        
        // Add to current balance
        user.currentBalance += totalSellingAmount;
        
        // Calculate profit/loss
        const totalBuyingAmount = transaction.buyingPrice * quantity;
        const profitLoss = totalSellingAmount - totalBuyingAmount;

        await user.save();

        console.log('Stock sold successfully. New balance:', user.currentBalance);

        res.status(200).json({
            success: true,
            message: 'Stock sold successfully',
            data: {
                transaction,
                newBalance: user.currentBalance,
                profitLoss: profitLoss,
                totalSellingAmount: totalSellingAmount
            }
        });

    } catch (error) {
        console.error('Error selling stock:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;