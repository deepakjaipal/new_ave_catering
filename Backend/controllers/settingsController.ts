import asyncHandler from 'express-async-handler';
import Settings from '../models/settingsModel.js';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req: any, res) => {
  let settings = await Settings.findOne();

  // If no settings exist, create default settings
  if (!settings) {
    settings = new Settings({
      siteName: 'AVE Catering',
      siteDescription: 'Professional catering supplies and equipment',
      contactEmail: 'admin@avecatering.com',
      contactPhone: '+1 (555) 123-4567',
      address: {
        street: '123 Business St',
        city: 'Business City',
        state: 'BC',
        zipCode: '12345',
        country: 'United States',
      },
      business: {
        name: 'AVE Catering LLC',
        taxId: '',
        licenseNumber: '',
      },
      shipping: {
        freeShippingThreshold: 100,
        standardShippingRate: 10,
        expressShippingRate: 25,
        processingTime: 2,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        orderNotifications: true,
        lowStockNotifications: true,
      },
      inventory: {
        lowStockThreshold: 10,
        autoReorder: false,
        reorderQuantity: 50,
      },
      features: {
        enableOffers: true,
        enableReviews: true,
        enableWishlist: true,
        enableNotifications: true,
      },
      maintenance: {
        isMaintenanceMode: false,
        maintenanceMessage: 'We are currently performing maintenance. Please check back later.',
      },
      updatedBy: req.user._id,
    });

    await settings.save();
  }

  res.json(settings);
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req: any, res) => {
  const {
    siteName,
    siteDescription,
    contactEmail,
    contactPhone,
    address,
    business,
    shipping,
    payment,
    notifications,
    inventory,
    features,
    social,
    seo,
    maintenance,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    // Create new settings if none exist
    settings = new Settings({
      updatedBy: req.user._id,
    });
  }

  // Update fields
  if (siteName !== undefined) settings.siteName = siteName;
  if (siteDescription !== undefined) settings.siteDescription = siteDescription;
  if (contactEmail !== undefined) settings.contactEmail = contactEmail;
  if (contactPhone !== undefined) settings.contactPhone = contactPhone;
  if (address !== undefined) settings.address = { ...settings.address, ...address };
  if (business !== undefined) settings.business = { ...settings.business, ...business };
  if (shipping !== undefined) settings.shipping = { ...settings.shipping, ...shipping };
  if (payment !== undefined) settings.payment = { ...settings.payment, ...payment };
  if (notifications !== undefined) settings.notifications = { ...settings.notifications, ...notifications };
  if (inventory !== undefined) settings.inventory = { ...settings.inventory, ...inventory };
  if (features !== undefined) settings.features = { ...settings.features, ...features };
  if (social !== undefined) settings.social = { ...settings.social, ...social };
  if (seo !== undefined) settings.seo = { ...settings.seo, ...seo };
  if (maintenance !== undefined) settings.maintenance = { ...settings.maintenance, ...maintenance };

  settings.updatedBy = req.user._id;

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private/Admin
const resetSettings = asyncHandler(async (req: any, res) => {
  await Settings.deleteMany({});

  const defaultSettings = new Settings({
    siteName: 'AVE Catering',
    siteDescription: 'Professional catering supplies and equipment',
    contactEmail: 'admin@avecatering.com',
    contactPhone: '+1 (555) 123-4567',
    address: {
      street: '123 Business St',
      city: 'Business City',
      state: 'BC',
      zipCode: '12345',
      country: 'United States',
    },
    business: {
      name: 'AVE Catering LLC',
      taxId: '',
      licenseNumber: '',
    },
    shipping: {
      freeShippingThreshold: 100,
      standardShippingRate: 10,
      expressShippingRate: 25,
      processingTime: 2,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      lowStockNotifications: true,
    },
    inventory: {
      lowStockThreshold: 10,
      autoReorder: false,
      reorderQuantity: 50,
    },
    features: {
      enableOffers: true,
      enableReviews: true,
      enableWishlist: true,
      enableNotifications: true,
    },
    maintenance: {
      isMaintenanceMode: false,
      maintenanceMessage: 'We are currently performing maintenance. Please check back later.',
    },
    updatedBy: req.user._id,
  });

  const resetSettings = await defaultSettings.save();
  res.json(resetSettings);
});

// @desc    Get public settings (for frontend)
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne().select(
    'siteName siteDescription contactEmail contactPhone address social seo maintenance'
  );

  if (!settings) {
    res.json({
      siteName: 'AVE Catering',
      siteDescription: 'Professional catering supplies and equipment',
      contactEmail: 'admin@avecatering.com',
      contactPhone: '+1 (555) 123-4567',
      address: {
        street: '123 Business St',
        city: 'Business City',
        state: 'BC',
        zipCode: '12345',
        country: 'United States',
      },
      social: {},
      seo: {},
      maintenance: {
        isMaintenanceMode: false,
        maintenanceMessage: 'We are currently performing maintenance. Please check back later.',
      },
    });
    return;
  }

  res.json(settings);
});

export {
  getSettings,
  updateSettings,
  resetSettings,
  getPublicSettings,
};
