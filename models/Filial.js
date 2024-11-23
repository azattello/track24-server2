const mongoose = require('mongoose');

const FilialSchema = new mongoose.Schema({
  filialText: { type: String, required: true },
  userPhone: { type: Number, required: true },
  filialId: { type: String, required: true },
  filialAddress: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Ссылка на пользователя
  createdAt: { type: Date, default: Date.now },
  logoPath: { type: String, default: null },

  // Настройки филиала
  videoLink: { type: String, default: '' },
  chinaAddress: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  aboutUsText: { type: String, default: '' },
  prohibitedItemsText: { type: String, default: '' },
  deliveryTime: { type: String, default: '' }, // Срок доставки
  cargoResponsibility: { type: String, default: '' } // Ответственность за груз
});

const Filial = mongoose.model('Filial', FilialSchema);

module.exports = Filial;
