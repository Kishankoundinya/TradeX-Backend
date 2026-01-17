const { userModel } = require('../Model/userModel');

const getUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User doesn't exist"
            });
        }

        return res.status(200).json({
            success: true,
            userData: {
                name: user.name,
                email:user.email,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (e) {
        console.error('Error in getUserData:', e.message);
        return res.status(500).json({
            success: false,
            message: e.message || 'Internal server error'
        });
    }
}

module.exports = { getUserData };