const mongoose = require('mongoose');
require('dotenv').config();


const db="mongodb+srv://himanadhkondabathini:Himanadh%401234@cluster0.y77ij.mongodb.net/chat?retryWrites=true&w=majority&appName=Cluster0"
const connectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        console.log('⚠️ MongoDB already connected.');
        return; 
    }

    try {
        await mongoose.connect(db); // 🔥 Remove deprecated options
        console.log('✅ MongoDB Atlas Connected...');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
};


module.exports = connectDB;