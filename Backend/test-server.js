const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mock category creation endpoint
app.post('/api/categories/admin/create', upload.single('image'), (req, res) => {
  console.log('Received request:', req.body);
  console.log('Files:', req.file);
  
  const { name, description, displayOrder, isActive, parentCategoryId } = req.body;
  
  // Mock response
  const mockCategory = {
    _id: 'mock-id-' + Date.now(),
    name,
    description,
    displayOrder: parseInt(displayOrder) || 0,
    isActive: isActive === 'true',
    parentCategory: parentCategoryId || null,
    level: parentCategoryId ? 1 : 0,
    path: parentCategoryId ? 'parent-path' : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json(mockCategory);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});