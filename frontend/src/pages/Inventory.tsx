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
  Inventory2 as InventoryIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
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

const Inventory: React.FC = () => {  const { inventoryId } = useParams<{ inventoryId: string }>();
  const navigate = useNavigate();
  
  const [inventoryName, setInventoryName] = useState<string>('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: 0,
    customFields: {} as { [key: string]: any },
  });const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Field management state
  const [newField, setNewField] = useState<CustomField>({
    id: '',
    name: '',
    type: 'text',
    required: false,
    options: [],
  });
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [newOption, setNewOption] = useState('');  // Load inventory data from localStorage
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
    
    // Load items for this inventory from localStorage
    const savedItems = localStorage.getItem(`inventory_items_${inventoryId}`);
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Error parsing saved items:', error);
        setItems([]);
      }    } else {
      // For existing default inventories, initialize with sample items
      if (foundInventory && foundInventory.id <= 4) {
        const mockItems: InventoryItem[] = [
          {
            id: 1,
            name: 'Blue Pens',
            description: 'Standard blue ballpoint pens',
            quantity: 150,
            customFields: {},
            lastUpdated: '2024-01-15',
          },
          {
            id: 2,
            name: 'A4 Paper',
            description: 'White A4 printer paper',
            quantity: 25,
            customFields: {},
            lastUpdated: '2024-01-14',
          },
        ];
        setItems(mockItems);
        localStorage.setItem(`inventory_items_${inventoryId}`, JSON.stringify(mockItems));
      } else {
        setItems([]);
      }
    }
  }, [inventoryId]);
  const handleAddItem = () => {
    const item: InventoryItem = {
      id: Date.now(),
      ...newItem,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    
    const updatedItems = [...items, item];
    setItems(updatedItems);
    // Save to localStorage
    localStorage.setItem(`inventory_items_${inventoryId}`, JSON.stringify(updatedItems));
    
    setNewItem({
      name: '',
      description: '',
      quantity: 0,
      customFields: {},
    });
    setOpenAddDialog(false);
    setSnackbar({
      open: true,
      message: 'Item added successfully!',
      severity: 'success',
    });
  };  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      customFields: item.customFields ? { ...item.customFields } : {},
    });
    setOpenEditDialog(true);
  };
  const handleUpdateItem = () => {
    if (!selectedItem) return;
    
    const updatedItems = items.map(item =>
      item.id === selectedItem.id
        ? { ...selectedItem, ...newItem, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    );
    
    setItems(updatedItems);
    // Save to localStorage
    localStorage.setItem(`inventory_items_${inventoryId}`, JSON.stringify(updatedItems));
      setSelectedItem(null);
    setNewItem({
      name: '',
      description: '',
      quantity: 0,
      customFields: {},
    });
    setOpenEditDialog(false);
    setSnackbar({
      open: true,
      message: 'Item updated successfully!',
      severity: 'success',
    });
  };  const handleDeleteItem = (itemId: number) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    // Save to localStorage
    localStorage.setItem(`inventory_items_${inventoryId}`, JSON.stringify(updatedItems));
    
    setSnackbar({
      open: true,
      message: 'Item deleted successfully!',
      severity: 'success',
    });
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
    localStorage.setItem(`inventory_items_${inventoryId}`, JSON.stringify(updatedItems));
    
    setSnackbar({
      open: true,
      message: `Quantity ${change > 0 ? 'increased' : 'decreased'} successfully!`,
      severity: 'success',
    });
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
      </Paper>      {/* Summary Stats */}
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
      </Paper>      {/* Items Display - List or Grid View */}
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
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">Add Item</Button>
        </DialogActions>
      </Dialog>      {/* Edit Item Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
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
