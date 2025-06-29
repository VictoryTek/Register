import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fab,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory2 as InventoryIcon,  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Remove as RemoveIcon,
  Link as LinkIcon,
  ContentPaste as ContentPasteIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  tags?: string[]; // Add tags field
  customFields: { [key: string]: any };
  lastUpdated: string;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

interface Inventory {
  id: number;
  name: string;
  customFields?: CustomField[];
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Inventory: React.FC = () => {  const { inventoryId } = useParams<{ inventoryId: string }>();
  const navigate = useNavigate();
  
  const [inventoryName, setInventoryName] = useState<string>('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: 0,
    tags: [] as string[],
    customFields: {} as { [key: string]: any },
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [newField, setNewField] = useState<CustomField>({
    id: '',
    name: '',
    type: 'text',
    required: false,
    options: [],
  });
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [newOption, setNewOption] = useState('');
  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [newTagInput, setNewTagInput] = useState('');
  
  // Load inventory data from localStorage
  useEffect(() => {
    // Load inventories from localStorage to find the current one
    const savedInventories = localStorage.getItem('inventories');
    let inventories = [];
    
    if (savedInventories) {
      try {
        inventories = JSON.parse(savedInventories);
      } catch (error) {
        console.error('Error parsing saved inventories:', error);
      }
    }
    
    const foundInventory = inventories.find((inv: any) => inv.id === parseInt(inventoryId || '0'));
    setInventoryName(foundInventory?.name || 'Unknown Inventory');
    setCustomFields(foundInventory?.customFields || []);
  }, [inventoryId]);  useEffect(() => {
    // Fetch inventory items from backend
    axios.get(`${API_BASE_URL}/api/v1/inventory`)
      .then(res => setItems(res.data))
      .catch(() => setItems([]));
  }, []);

  const handleAddItem = async () => {
    try {
      const payload = {
        ...newItem,
        tags: newItem.tags?.map(tag => ({ name: tag })) || [],
      };
      const res = await axios.post(`${API_BASE_URL}/api/v1/inventory`, payload);
      setItems([...items, res.data]);
      setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to add item.', severity: 'error' });
    }
    setNewItem({ name: '', description: '', quantity: 0, tags: [], customFields: {} });
    setOpenAddDialog(false);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      tags: item.tags || [],
      customFields: item.customFields ? { ...item.customFields } : {},
    });
    setOpenEditDialog(true);
  };  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    try {
      const payload = {
        ...newItem,
        tags: newItem.tags?.map(tag => ({ name: tag })) || [],
      };
      const res = await axios.put(`${API_BASE_URL}/api/v1/inventory/${selectedItem.id}`, payload);
      setItems(items.map(item => item.id === selectedItem.id ? res.data : item));
      setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to update item.', severity: 'error' });
    }
    setSelectedItem(null);
    setNewItem({ name: '', description: '', quantity: 0, tags: [], customFields: {} });
    setOpenEditDialog(false);
  };const handleDeleteItem = async (itemId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/inventory/${itemId}`);
      setItems(items.filter(item => item.id !== itemId));
      setSnackbar({ open: true, message: 'Item deleted successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete item.', severity: 'error' });
    }
  };
  const handleQuantityChange = (itemId: number, change: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return item;
    });
    
    setItems(updatedItems);
    
    setSnackbar({
      open: true,
      message: `Quantity ${change > 0 ? 'increased' : 'decreased'} successfully!`,
      severity: 'success',
    });
  };
  // Intelligent field mapping function
  const mapExtractedDataToFields = (rawData: any, fields: CustomField[]) => {
    const mappedFields: { [key: string]: any } = {};
    
    // Create a mapping of common field names to extracted data
    const commonMappings: { [key: string]: string[] } = {
      sku: ['sku', 'model', 'item_number', 'product_id', 'upc', 'barcode'],
      brand: ['brand', 'manufacturer', 'maker', 'company'],
      category: ['category', 'type', 'department', 'classification'],
      price: ['price', 'cost', 'msrp', 'retail_price', 'value'],
      weight: ['weight', 'mass', 'pounds', 'kg', 'lbs'],
      dimensions: ['dimensions', 'size', 'measurements', 'length', 'width', 'height'],
      color: ['color', 'colour', 'finish', 'shade'],
      material: ['material', 'fabric', 'construction', 'composition'],
      warranty: ['warranty', 'guarantee', 'warranty_period'],
      condition: ['condition', 'state', 'quality'],
      status: ['status', 'availability', 'stock_status'],
      unit: ['unit', 'unit_of_measure', 'measurement_unit', 'packaging'],
      supplier: ['supplier', 'vendor', 'distributor', 'seller'],
      date_added: ['date_added', 'created_date', 'purchase_date'],
      expiry_date: ['expiry_date', 'expiration_date', 'best_by'],
    };    // Map extracted data to custom fields based on field names and types
    fields.forEach(field => {
      const fieldNameLower = field.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const fieldId = field.id.toLowerCase();
      
      // Try to find matching data in rawData
      let mappedValue: any = null;
      
      // Check if field ID matches extracted data keys
      if (rawData.extractedData && rawData.extractedData[fieldId]) {
        mappedValue = rawData.extractedData[fieldId];
      } else if (rawData.extractedData && rawData.extractedData[fieldNameLower]) {
        mappedValue = rawData.extractedData[fieldNameLower];
      } else {
        // Check common mappings
        for (const [commonField, aliases] of Object.entries(commonMappings)) {
          if (aliases.includes(fieldId) || aliases.includes(fieldNameLower)) {
            if (rawData.extractedData && rawData.extractedData[commonField]) {
              mappedValue = rawData.extractedData[commonField];
              break;
            }
          }
        }
      }
      
      // Apply type-specific transformations
      if (mappedValue !== null && mappedValue !== undefined) {
        switch (field.type) {
          case 'number':
            const numValue = parseFloat(String(mappedValue));
            if (!isNaN(numValue)) {
              mappedFields[field.id] = numValue;
            }
            break;
          
          case 'date':
            // Try to parse date
            const dateValue = new Date(String(mappedValue));
            if (!isNaN(dateValue.getTime())) {
              mappedFields[field.id] = dateValue.toISOString().split('T')[0];
            }
            break;
            
          case 'select':
            // Check if extracted value matches any of the field options
            if (field.options && field.options.length > 0) {
              const mappedValueStr = String(mappedValue);
              const matchingOption = field.options.find(option => 
                option.toLowerCase() === mappedValueStr.toLowerCase() ||
                mappedValueStr.toLowerCase().includes(option.toLowerCase()) ||
                option.toLowerCase().includes(mappedValueStr.toLowerCase())
              );
              if (matchingOption) {
                mappedFields[field.id] = matchingOption;
              } else {
                // Default mapping for common select fields
                if (fieldId === 'status' || fieldNameLower.includes('status')) {
                  mappedFields[field.id] = getDefaultStatus(mappedValueStr, field.options);
                } else if (fieldId === 'condition') {
                  mappedFields[field.id] = getDefaultCondition(mappedValueStr, field.options);
                }
              }
            }
            break;
            
          case 'text':
          default:
            mappedFields[field.id] = String(mappedValue);
            break;
        }
      }
    });

    // Add default values for common fields if they weren't mapped
    addDefaultFieldValues(mappedFields, fields, rawData);

    return {
      name: rawData.name,
      description: rawData.description,
      customFields: mappedFields,
    };
  };

  // Helper function to get default status
  const getDefaultStatus = (extractedStatus: string, options: string[]) => {
    const status = extractedStatus.toLowerCase();
    if (status.includes('in stock') || status.includes('available')) {
      return options.find(opt => opt.toLowerCase().includes('stock')) || options[0];
    } else if (status.includes('out of stock') || status.includes('unavailable')) {
      return options.find(opt => opt.toLowerCase().includes('out')) || options[options.length - 1];
    } else if (status.includes('low stock') || status.includes('limited')) {
      return options.find(opt => opt.toLowerCase().includes('low')) || options[1];
    }
    return options[0]; // Default to first option
  };

  // Helper function to get default condition
  const getDefaultCondition = (extractedCondition: string, options: string[]) => {
    const condition = extractedCondition.toLowerCase();
    if (condition.includes('new') || condition.includes('brand new')) {
      return options.find(opt => opt.toLowerCase().includes('new')) || options[0];
    } else if (condition.includes('used') || condition.includes('refurbished')) {
      return options.find(opt => opt.toLowerCase().includes('used') || opt.toLowerCase().includes('refurbished')) || options[1];
    }
    return options[0];
  };

  // Add default values for unmapped but important fields
  const addDefaultFieldValues = (mappedFields: { [key: string]: any }, fields: CustomField[], rawData: any) => {
    fields.forEach(field => {
      if (!mappedFields[field.id]) {
        // Add defaults for common required fields
        if (field.id === 'sku' && field.required) {
          mappedFields[field.id] = rawData.generatedSku || generateSkuFromUrl(rawData.url);
        } else if (field.id === 'unit' && field.type === 'select' && field.options) {
          mappedFields[field.id] = field.options.includes('pieces') ? 'pieces' : field.options[0];
        } else if (field.id === 'status' && field.type === 'select' && field.options) {
          mappedFields[field.id] = field.options.find(opt => opt.toLowerCase().includes('stock')) || field.options[0];
        }
      }
    });
  };

  // Generate SKU from URL if not provided
  const generateSkuFromUrl = (url: string) => {
    const domain = new URL(url).hostname.toLowerCase();
    const prefix = domain.includes('amazon') ? 'AMZ' : 
                  domain.includes('walmart') ? 'WMT' :
                  domain.includes('target') ? 'TGT' :
                  domain.includes('bestbuy') ? 'BBY' : 'GEN';
    return `${prefix}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  // Get mapping details for user feedback
  const getMappingDetails = (rawData: any, mappedData: any, fields: CustomField[]) => {
    const mappedCount = Object.keys(mappedData.customFields).length;
    const totalFields = fields.length;
    return `Mapped ${mappedCount}/${totalFields} fields automatically.`;
  };
  // Function to scan product URL and extract information
  const scanProductUrl = async (url: string) => {
    try {
      // This is a mock implementation - in a real app you'd need a backend service
      // or use a CORS proxy to fetch and parse the webpage
      
      // For demonstration, we'll simulate different retailer patterns
      const domain = new URL(url).hostname.toLowerCase();
      
      // Simulate extraction based on common retailer patterns
      if (domain.includes('amazon')) {
        return extractAmazonProduct(url);
      } else if (domain.includes('walmart')) {
        return extractWalmartProduct(url);
      } else if (domain.includes('target')) {
        return extractTargetProduct(url);
      } else if (domain.includes('bestbuy')) {
        return extractBestBuyProduct(url);
      } else {
        return extractGenericProduct(url);
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  };

  // Enhanced mock extraction functions with comprehensive data
  const extractAmazonProduct = async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      url,
      name: 'Echo Dot (5th Gen) Smart Speaker',
      description: 'Compact smart speaker with Alexa voice control, improved audio quality, and smart home hub capabilities.',
      generatedSku: 'AMZ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      extractedData: {
        brand: 'Amazon',
        category: 'Electronics',
        price: 49.99,
        weight: '0.75 lbs',
        dimensions: '3.9 x 3.9 x 3.5 inches',
        color: 'Charcoal',
        warranty: '1 year',
        condition: 'New',
        status: 'In Stock',
        unit: 'pieces',
        material: 'Plastic',
        sku: 'B09B8V1LZ3',
        supplier: 'Amazon',
      },
    };
  };

  const extractWalmartProduct = async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      url,
      name: 'Great Value Organic Whole Milk',
      description: 'Organic whole milk, 1 gallon. Rich, creamy taste from pasture-raised cows.',
      generatedSku: 'WMT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      extractedData: {
        brand: 'Great Value',
        category: 'Dairy',
        price: 4.98,
        weight: '8.6 lbs',
        expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        condition: 'Fresh',
        status: 'In Stock',
        unit: 'gallons',
        supplier: 'Walmart',
        sku: 'WMT-MILK-001',
      },
    };
  };

  const extractTargetProduct = async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      url,
      name: 'Goodfellow & Co. Men\'s Crew Neck T-Shirt',
      description: 'Classic fit crew neck t-shirt made from soft cotton blend. Perfect for everyday wear.',
      generatedSku: 'TGT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      extractedData: {
        brand: 'Goodfellow & Co.',
        category: 'Clothing',
        price: 6.00,
        color: 'Navy Blue',
        material: 'Cotton Blend',
        condition: 'New',
        status: 'Low Stock',
        unit: 'pieces',
        supplier: 'Target',
        sku: 'TGT-TEE-54321',
      },
    };
  };

  const extractBestBuyProduct = async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      url,
      name: 'Apple iPhone 15 Pro 128GB',
      description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
      generatedSku: 'BBY-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      extractedData: {
        brand: 'Apple',
        category: 'Smartphones',
        price: 999.99,
        weight: '0.41 lbs',
        dimensions: '5.77 x 2.78 x 0.32 inches',
        color: 'Natural Titanium',
        warranty: '1 year limited',
        condition: 'New',
        status: 'In Stock',
        unit: 'pieces',
        material: 'Titanium',
        sku: 'IPHONE15PRO128',
        supplier: 'Best Buy',
      },
    };
  };

  const extractGenericProduct = async (url: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      url,
      name: 'Generic Product Name',
      description: 'Product description extracted from webpage metadata and content.',
      generatedSku: 'GEN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      extractedData: {
        brand: 'Unknown Brand',
        category: 'General',
        condition: 'New',
        status: 'In Stock',
        unit: 'pieces',
        supplier: 'External Vendor',
      },
    };
  };

  // Field management functions
  const handleAddField = () => {
    if (!newField.name.trim()) return;
    
    const fieldToAdd: CustomField = {
      ...newField,
      id: newField.name.toLowerCase().replace(/\s+/g, '_'),
    };
    
    const updatedFields = [...customFields, fieldToAdd];
    setCustomFields(updatedFields);
    
    // Update inventory in localStorage
    updateInventoryFields(updatedFields);
    
    // Reset form
    setNewField({
      id: '',
      name: '',
      type: 'text',
      required: false,
      options: [],
    });
    
    setSnackbar({
      open: true,
      message: 'Field added successfully!',
      severity: 'success',
    });
  };

  const handleEditField = (index: number) => {
    setEditingFieldIndex(index);
    setNewField({ ...customFields[index] });
  };

  const handleUpdateField = () => {
    if (editingFieldIndex === null || !newField.name.trim()) return;
    
    const updatedFields = [...customFields];
    updatedFields[editingFieldIndex] = {
      ...newField,
      id: newField.name.toLowerCase().replace(/\s+/g, '_'),
    };
    
    setCustomFields(updatedFields);
    updateInventoryFields(updatedFields);
    
    setEditingFieldIndex(null);
    setNewField({
      id: '',
      name: '',
      type: 'text',
      required: false,
      options: [],
    });
    
    setSnackbar({
      open: true,
      message: 'Field updated successfully!',
      severity: 'success',
    });
  };

  const handleDeleteField = (index: number) => {
    const fieldToDelete = customFields[index];
    const updatedFields = customFields.filter((_, i) => i !== index);
    setCustomFields(updatedFields);
    updateInventoryFields(updatedFields);
    
    // Remove field data from all items
    const updatedItems = items.map(item => {
      const newCustomFields = { ...item.customFields };
      delete newCustomFields[fieldToDelete.id];
      return { ...item, customFields: newCustomFields };
    });
    setItems(updatedItems);
    localStorage.setItem(`inventory_items_${inventoryId}`, JSON.stringify(updatedItems));
    
    setSnackbar({
      open: true,
      message: 'Field deleted successfully!',
      severity: 'success',
    });
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    setNewField({
      ...newField,
      options: [...(newField.options || []), newOption.trim()],
    });
    setNewOption('');
  };

  const handleRemoveOption = (optionIndex: number) => {
    setNewField({
      ...newField,
      options: newField.options?.filter((_, i) => i !== optionIndex) || [],
    });
  };

  const updateInventoryFields = (fields: CustomField[]) => {
    // Update the inventory record in localStorage
    const savedInventories = localStorage.getItem('inventories');
    if (savedInventories) {
      try {
        const inventories = JSON.parse(savedInventories);
        const updatedInventories = inventories.map((inv: any) =>
          inv.id === parseInt(inventoryId || '0')
            ? { ...inv, customFields: fields }
            : inv
        );
        localStorage.setItem('inventories', JSON.stringify(updatedInventories));
      } catch (error) {
        console.error('Error updating inventory fields:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'success';
      case 'Low Stock': return 'warning';
      case 'Out of Stock': return 'error';
      default: return 'default';
    }
  };
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  // Helper function to render form fields based on custom field definitions
  const renderCustomField = (field: CustomField, value: any, onChange: (fieldId: string, value: any) => void) => {
    const fieldValue = value !== undefined && value !== null ? value : '';
    
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.name}
            value={fieldValue}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <TextField
            fullWidth
            label={field.name}
            type="number"
            value={fieldValue}
            onChange={(e) => onChange(field.id, e.target.value ? Number(e.target.value) : '')}
            required={field.required}
          />
        );
      
      case 'date':
        return (
          <TextField
            fullWidth
            label={field.name}
            type="date"
            value={fieldValue}
            onChange={(e) => onChange(field.id, e.target.value)}
            required={field.required}
            InputLabelProps={{ shrink: true }}
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth required={field.required}>
            <InputLabel>{field.name}</InputLabel>
            <Select
              value={fieldValue}
              label={field.name}
              onChange={(e) => onChange(field.id, e.target.value)}
            >
              {field.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      default:
        return null;
    }
  };const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate status-based stats only if status field exists
  const getStatusFromCustomFields = (item: InventoryItem) => {
    const statusField = customFields.find(field => field.id === 'status');
    if (statusField && item.customFields && item.customFields.status) {
      return item.customFields.status;
    }
    return null;
  };
  
  const lowStockItems = items.filter(item => {
    const status = getStatusFromCustomFields(item);
    return status === 'Low Stock';
  }).length;
  
  const outOfStockItems = items.filter(item => {
    const status = getStatusFromCustomFields(item);
    return status === 'Out of Stock';
  }).length;

  return (
    <Container maxWidth="xl">
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            color="inherit"
            href="#"
            onClick={() => navigate('/catalog')}
            sx={{ cursor: 'pointer' }}
          >
            Inventory Management
          </Link>
          <Typography color="text.primary">{inventoryName}</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton
            onClick={() => navigate('/catalog')}
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <InventoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {inventoryName} - Items
          </Typography>        </Box>
      </Box>

      {/* Action Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ minWidth: 120 }}
          >
            Filter
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setOpenFieldDialog(true)}
            sx={{ minWidth: 140 }}
          >
            Manage Fields
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            startIcon={<ViewListIcon />}
            size="small"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            startIcon={<ViewModuleIcon />}
            size="small"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
        </Box>
      </Paper>
      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main">
              {totalItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Item Types
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {totalQuantity}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Quantity
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {lowStockItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Low Stock Items
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {outOfStockItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Out of Stock
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* View Toggle Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Inventory Items
          </Typography>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            startIcon={<ViewListIcon />}
            size="small"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            startIcon={<ViewModuleIcon />}
            size="small"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
        </Box>
      </Paper>
      {/* Items Display - List or Grid View */}
      {viewMode === 'list' ? (
        /* List View */
        <Paper sx={{ mb: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Quantity</TableCell>
                  {customFields.map((field) => (
                    <TableCell key={field.id}>{field.name}</TableCell>
                  ))}
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantity <= 0}
                          title="Decrease quantity"
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          title="Increase quantity"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    {customFields.map((field) => (
                      <TableCell key={field.id}>
                        {field.type === 'select' && field.id === 'status' ? (
                          <Chip
                            label={item.customFields[field.id] || 'N/A'}
                            color={getStatusColor(item.customFields[field.id] || '') as any}
                            size="small"
                          />
                        ) : (
                          item.customFields[field.id] || 'N/A'
                        )}
                      </TableCell>
                    ))}
                    <TableCell>{item.lastUpdated}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item)}
                          title="Edit Item"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete Item"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5 + customFields.length} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No items found in this inventory.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddDialog(true)}
                        sx={{ mt: 2 }}
                      >
                        Add First Item
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>      ) : (
        /* Grid View */
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {item.name}
                    </Typography>
                    {/* Show status chip if status field exists */}
                    {customFields.find(f => f.id === 'status') && item.customFields.status && (
                      <Chip
                        label={item.customFields.status}
                        color={getStatusColor(item.customFields.status) as any}
                        size="small"
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.description}
                  </Typography>                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Quantity:</strong>
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={item.quantity <= 0}
                        title="Decrease quantity"
                        sx={{ p: 0.5 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        title="Increase quantity"
                        sx={{ p: 0.5 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {/* Render custom fields */}
                    {customFields.map((field) => (
                      <Typography variant="body2" color="text.secondary" key={field.id} sx={{ mb: 0.5 }}>
                        <strong>{field.name}:</strong> {item.customFields[field.id] || 'N/A'}
                      </Typography>
                    ))}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Updated: {item.lastUpdated}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditItem(item)}
                    title="Edit Item"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Delete Item"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {items.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No items found in this inventory.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Add First Item
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Add Item FAB */}
      {items.length > 0 && (
        <Fab
          color="primary"
          aria-label="add item"
          onClick={() => setOpenAddDialog(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      )}      {/* Add Item Dialog */}
      <Dialog open={openAddDialog} onClose={() => {
        setOpenAddDialog(false);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Core fields */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {newItem.tags.map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    onDelete={() => setNewItem({ ...newItem, tags: newItem.tags.filter((_, i) => i !== idx) })}
                    size="small"
                    color="primary"
                  />
                ))}
                <TextField
                  variant="standard"
                  label={newItem.tags.length === 0 ? 'Add tag' : ''}
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTagInput.trim()) {
                      e.preventDefault();
                      if (!newItem.tags.includes(newTagInput.trim())) {
                        setNewItem({ ...newItem, tags: [...newItem.tags, newTagInput.trim()] });
                      }
                      setNewTagInput('');
                    }
                  }}
                  sx={{ minWidth: 120, flex: 1 }}
                  inputProps={{ maxLength: 32 }}
                />
              </Box>
            </Grid>
            
            {/* Dynamic custom fields */}
            {customFields.map((field) => (
              <Grid item xs={12} sm={field.type === 'text' && field.name.toLowerCase().includes('description') ? 12 : 6} key={field.id}>                {renderCustomField(field, newItem.customFields?.[field.id], (fieldId, value) => {
                  setNewItem({
                    ...newItem,
                    customFields: {
                      ...newItem.customFields,
                      [fieldId]: value,
                    },
                  });
                })}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenAddDialog(false);
          }}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">Add Item</Button>
        </DialogActions>
      </Dialog>      {/* Edit Item Dialog */}
      <Dialog open={openEditDialog} onClose={() => {
        setOpenEditDialog(false);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Core fields */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                {newItem.tags.map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    onDelete={() => setNewItem({ ...newItem, tags: newItem.tags.filter((_, i) => i !== idx) })}
                    size="small"
                    color="primary"
                  />
                ))}
                <TextField
                  variant="standard"
                  label={newItem.tags.length === 0 ? 'Add tag' : ''}
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newTagInput.trim()) {
                      e.preventDefault();
                      if (!newItem.tags.includes(newTagInput.trim())) {
                        setNewItem({ ...newItem, tags: [...newItem.tags, newTagInput.trim()] });
                      }
                      setNewTagInput('');
                    }
                  }}
                  sx={{ minWidth: 120, flex: 1 }}
                  inputProps={{ maxLength: 32 }}
                />
              </Box>
            </Grid>
            
            {/* Dynamic custom fields */}
            {customFields.map((field) => (
              <Grid item xs={12} sm={field.type === 'text' && field.name.toLowerCase().includes('description') ? 12 : 6} key={field.id}>                {renderCustomField(field, newItem.customFields?.[field.id], (fieldId, value) => {
                  setNewItem({
                    ...newItem,
                    customFields: {
                      ...newItem.customFields,
                      [fieldId]: value,
                    },
                  });
                })}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditDialog(false);
          }}>Cancel</Button>
          <Button onClick={handleUpdateItem} variant="contained">Update Item</Button>
        </DialogActions>
      </Dialog>

      {/* Field Management Dialog */}
      <Dialog open={openFieldDialog} onClose={() => setOpenFieldDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Custom Fields</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Existing Fields List */}
            <Typography variant="h6" gutterBottom>
              Current Fields
            </Typography>
            {customFields.length > 0 ? (
              <List sx={{ mb: 3 }}>
                {customFields.map((field, index) => (
                  <React.Fragment key={field.id}>
                    <ListItem>
                      <ListItemText
                        primary={field.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Type: {field.type} {field.required && '(Required)'}
                            </Typography>
                            {field.options && field.options.length > 0 && (
                              <Typography variant="body2" color="text.secondary">
                                Options: {field.options.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleEditField(index)}
                          title="Edit Field"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteField(index)}
                          title="Delete Field"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < customFields.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, py: 2, textAlign: 'center' }}>
                No custom fields defined yet.
              </Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Add/Edit Field Form */}
            <Typography variant="h6" gutterBottom>
              {editingFieldIndex !== null ? 'Edit Field' : 'Add New Field'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Field Name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={newField.type}
                    label="Field Type"
                    onChange={(e) => setNewField({ 
                      ...newField, 
                      type: e.target.value as any,
                      options: e.target.value === 'select' ? [] : undefined 
                    })}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="select">Select (Dropdown)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    />
                  }
                  label="Required field"
                />
              </Grid>
              
              {/* Select field options */}
              {newField.type === 'select' && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Dropdown Options
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add Option"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddOption();
                          }
                        }}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddOption}
                        disabled={!newOption.trim()}
                        sx={{ minWidth: 80 }}
                      >
                        Add
                      </Button>
                    </Stack>
                    {newField.options && newField.options.length > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Current options:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {newField.options.map((option, optionIndex) => (
                            <Chip
                              key={optionIndex}
                              label={option}
                              onDelete={() => handleRemoveOption(optionIndex)}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={editingFieldIndex !== null ? handleUpdateField : handleAddField}
                    disabled={!newField.name.trim() || (newField.type === 'select' && (!newField.options || newField.options.length === 0))}
                  >
                    {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
                  </Button>
                  {editingFieldIndex !== null && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditingFieldIndex(null);
                        setNewField({
                          id: '',
                          name: '',
                          type: 'text',
                          required: false,
                          options: [],
                        });
                        setNewOption('');
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFieldDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Inventory;
