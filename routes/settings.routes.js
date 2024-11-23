const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const Contacts = require('../models/Contacts');
const Filial = require('../models/Filial');
const User = require("../models/User") 
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');


// Конфигурация multer для загрузки документов
const contractStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/contracts/';
        cb(null, dir); // Папка для сохранения документов
    },
    filename: function (req, file, cb) {
        // Генерация уникального имени файла
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const uploadContract = multer({ storage: contractStorage });

// Маршрут для обновления настроек
router.post('/updateSettings', uploadContract.single('contract'), [
    check('videoLink').optional().isString(),
    check('chinaAddress').optional().isString(),
    check('whatsappNumber').optional().isString(),
    check('aboutUsText').optional().isString(),
    check('prohibitedItemsText').optional().isString(),
    check('deliveryTime').optional().isString(),
    check('cargoResponsibility').optional().isString(),
    check('userId').not().isEmpty().withMessage('userId is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Неверный запрос', errors });
        }

        const { videoLink, chinaAddress, whatsappNumber, aboutUsText, prohibitedItemsText, deliveryTime, cargoResponsibility, userId } = req.body;
        // Находим пользователя по userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Проверяем роль пользователя
        if (user.role === 'admin') {
            // Для admin обновляем настройки в модели Settings
            let settings = await Settings.findOne();
            if (!settings) {
                settings = new Settings();
            }

            // Обновляем поля настроек
            if (videoLink) settings.videoLink = videoLink;
            if (chinaAddress) settings.chinaAddress = chinaAddress;
            if (whatsappNumber) settings.whatsappNumber = whatsappNumber;
            if (aboutUsText) settings.aboutUsText = aboutUsText;
            if (prohibitedItemsText) settings.prohibitedItemsText = prohibitedItemsText;
            if (deliveryTime) settings.deliveryTime = deliveryTime;
            if (cargoResponsibility) settings.cargoResponsibility = cargoResponsibility;

            // Обработка загруженного файла, если он есть
            if (req.file) {
                const contractPath = `/uploads/contracts/${req.file.filename}`;
                settings.contractFilePath = contractPath; // Сохраняем путь к загруженному документу
            }

            // Сохраняем изменения в базе данных
            await settings.save();
            return res.status(200).json(settings); // Возвращаем обновленные настройки
        }

        if (user.role === 'filial') {
            // Для filial находим филиал по номеру телефона
            const filial = await Filial.findOne({ userPhone: user.phone });

            if (!filial) {
                return res.status(404).json({ message: 'Filial not found' });
            }

            // Обновляем данные филиала
            if (videoLink) filial.videoLink = videoLink;
            if (chinaAddress) filial.chinaAddress = chinaAddress;
            if (whatsappNumber) filial.whatsappNumber = whatsappNumber;
            if (aboutUsText) filial.aboutUsText = aboutUsText;
            if (prohibitedItemsText) filial.prohibitedItemsText = prohibitedItemsText;
            if (deliveryTime) filial.deliveryTime = deliveryTime;
            if (cargoResponsibility) filial.cargoResponsibility = cargoResponsibility;
            
            // Обработка загруженного файла, если он есть
            if (req.file) {
                const contractPath = `/uploads/contracts/${req.file.filename}`;
                filial.contractFilePath = contractPath; // Сохраняем путь к загруженному документу
            }

            // Сохраняем изменения в базе данных
            await filial.save();
            return res.status(200).json(filial); // Возвращаем обновленные данные филиала
        }

        // Если роль пользователя не совпала с "admin" или "filial"
        return res.status(403).json({ message: 'Access denied' });
    } catch (error) {
        console.error('Ошибка при обновлении настроек:', error.message);
        res.status(500).send('Ошибка сервера.');
    }
});


router.get('/getSettings', async (req, res) => {
    try {
        const { userId } = req.query;

        // Находим пользователя по userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            // Для admin возвращаем настройки из Settings
            const settings = await Settings.findOne();
            return res.status(200).json(settings);
        }

        if (user.role === 'filial') {
            // Для filial возвращаем данные из соответствующего филиала
            const filial = await Filial.findOne({ userPhone: user.phone });

            if (!filial) {
                return res.status(404).json({ message: 'Filial not found' });
            }

            return res.status(200).json(filial);
        }

        return res.status(403).json({ message: 'Access denied' });
    } catch (error) {
        console.error('Ошибка при получении настроек:', error.message);
        res.status(500).send('Ошибка сервера.');
    }
});


// Контакты
router.post('/updateContacts', async (req, res) => {
    try {
        const {phone, whatsappPhone, whatsappLink, instagram, telegramId, telegramLink} = req.body;

        // Получаем текущие настройки или создаем новые
        let contacts = await Contacts.findOne();
        if (!contacts) {
            contacts = new Contacts();
        }

        // Обновляем поля настроек
        if (phone) contacts.phone = phone;
        if (whatsappPhone) contacts.whatsappPhone = whatsappPhone;
        if (whatsappLink) contacts.whatsappLink = whatsappLink;
        if (instagram) contacts.instagram = instagram;
        if (telegramId) contacts.telegramId = telegramId;
        if (telegramLink) contacts.telegramLink = telegramLink;


        // Сохраняем изменения в базе данных
        await contacts.save();
        res.status(200).json(contacts); // Возвращаем обновленные настройки

    } catch (error) {
        console.error('Ошибка при обновлении настроек:', error.message);
        res.status(500).send('Ошибка сервера.');
    }
});



// Маршрут для получения настроек
router.get('/getContacts', async (req, res) => {
    try {
        const contacts = await Contacts.findOne();
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Ошибка при получении настроек:', error.message);
        res.status(500).send('Ошибка сервера.');
    }
});




module.exports = router;