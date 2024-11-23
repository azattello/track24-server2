const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
    videoLink: { type: String, default: '' },
    chinaAddress: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    aboutUsText: { type: String, default: '' },
    prohibitedItemsText: { type: String, default: '' },
    contractFilePath: { type: String, default: '' }, // Поле для хранения пути к файлу
    deliveryTime: { type: String, default: '' }, // Срок доставки
    cargoResponsibility: { type: String, default: '' } // Ответственность за груз
});


module.exports = mongoose.model('Settings', SettingsSchema);
