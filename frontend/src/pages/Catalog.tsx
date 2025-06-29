import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Avatar,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

interface Inventory {
  id: number;
  name: string;
  description: string;
  type: string;
  color: string;
  image: string | null;
  itemCount: number;
  totalValue: string;
  status: string;
  lastUpdated: string;
  customFields?: CustomField[];
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[]; // For select fields
}

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [editInventory, setEditInventory] = useState({
    name: '',
    description: '',
    type: '',
    color: 'primary',
    image: null as string | null,
  });

  const [newInventory, setNewInventory] = useState({
    name: '',
    description: '',
    type: '',
    color: 'primary',
    image: null as string | null,
  });const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Default inventory types
  const defaultTypes = ['Warehouse', 'Storage Room', 'Secure Vault', 'Temporary'];

  // Load custom types from localStorage
  const [customTypes, setCustomTypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('customInventoryTypes');
    return saved ? JSON.parse(saved) : [];
  });

  // Save custom types to localStorage
  useEffect(() => {
    localStorage.setItem('customInventoryTypes', JSON.stringify(customTypes));
  }, [customTypes]);

  // Combined list of all available types
  const allTypes = [...defaultTypes, ...customTypes].filter((type, index, array) => 
    array.indexOf(type) === index // Remove duplicates
  );

  // State for custom type input
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState('');
  // Initialize default inventory data
  const defaultInventories: Inventory[] = [
    {
      id: 1,
      name: 'Main Warehouse A',
      description: 'Primary storage facility for electronics and small items',
      type: 'Warehouse',
      color: 'primary',
      image: null as string | null,
      itemCount: 245,
      totalValue: '$45,230',
      status: 'Active',
      lastUpdated: '2024-01-15',
      customFields: [
        { id: 'sku', name: 'SKU', type: 'text', required: true },
        { id: 'location', name: 'Location', type: 'text', required: false },
        { id: 'unit', name: 'Unit', type: 'select', required: true, options: ['pieces', 'boxes', 'kg', 'liters'] },
        { id: 'status', name: 'Status', type: 'select', required: true, options: ['In Stock', 'Low Stock', 'Out of Stock'] }
      ]
    },
    {
      id: 2,
      name: 'Office Supplies Storage',
      description: 'Dedicated storage for office supplies and stationery',
      type: 'Storage Room',
      color: 'secondary',
      image: null as string | null,
      itemCount: 89,
      totalValue: '$3,450',
      status: 'Active',
      lastUpdated: '2024-01-14',
      customFields: [
        { id: 'category', name: 'Category', type: 'select', required: true, options: ['Paper', 'Writing', 'Electronics', 'Furniture'] },
        { id: 'supplier', name: 'Supplier', type: 'text', required: false },
        { id: 'expiryDate', name: 'Expiry Date', type: 'date', required: false }
      ]
    },
    {
      id: 3,
      name: 'IT Equipment Vault',
      description: 'Secure storage for computers, servers, and IT equipment',
      type: 'Secure Vault',
      color: 'error',
      image: null as string | null,
      itemCount: 67,
      totalValue: '$78,900',
      status: 'Active',
      lastUpdated: '2024-01-13',
      customFields: [
        { id: 'serialNumber', name: 'Serial Number', type: 'text', required: true },
        { id: 'warranty', name: 'Warranty Date', type: 'date', required: false },
        { id: 'condition', name: 'Condition', type: 'select', required: true, options: ['New', 'Good', 'Fair', 'Needs Repair'] },
        { id: 'assignedTo', name: 'Assigned To', type: 'text', required: false }
      ]
    },
    {
      id: 4,
      name: 'Temporary Storage',
      description: 'Temporary holding area for incoming and outgoing items',
      type: 'Temporary',
      color: 'warning',
      image: null as string | null,
      itemCount: 12,
      totalValue: '$890',
      status: 'Maintenance',
      lastUpdated: '2024-01-10',
      customFields: [
        { id: 'arrivalDate', name: 'Arrival Date', type: 'date', required: true },
        { id: 'destination', name: 'Destination', type: 'text', required: false },
        { id: 'priority', name: 'Priority', type: 'select', required: true, options: ['High', 'Medium', 'Low'] }
      ]
    },
  ];

  // Load inventories from localStorage or use defaults
  const [inventories, setInventories] = useState(() => {
    const savedInventories = localStorage.getItem('inventories');
    if (savedInventories) {
      try {
        return JSON.parse(savedInventories);
      } catch (error) {
        console.error('Error parsing saved inventories:', error);
        return defaultInventories;
      }
    }
    return defaultInventories;
  });

  // Save inventories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('inventories', JSON.stringify(inventories));
  }, [inventories]);
  // Update inventory statistics based on actual items in localStorage
  const updateInventoryStats = () => {
    const updatedInventories = inventories.map((inventory: Inventory) => {
      const savedItems = localStorage.getItem(`inventory_items_${inventory.id}`);
      let itemCount = 0;
      let totalValue = 0;
      
      if (savedItems) {
        try {
          const items = JSON.parse(savedItems);
          itemCount = items.length;
          // For demo purposes, calculate a mock total value based on quantity
          totalValue = items.reduce((sum: number, item: any) => {
            // Simple mock calculation: quantity * $10 per unit
            return sum + (item.quantity * 10);
          }, 0);
        } catch (error) {
          console.error('Error parsing items for inventory', inventory.id, error);
        }
      }
      
      return {
        ...inventory,
        itemCount,
        totalValue: `$${totalValue.toLocaleString()}`,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    });
    
    if (JSON.stringify(updatedInventories) !== JSON.stringify(inventories)) {
      setInventories(updatedInventories);
    }
  };  // Update stats when component mounts and when returning from other pages
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateInventoryStats();
      }
    };
    
    const handleFocus = () => {
      updateInventoryStats();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('inventory_items_')) {
        updateInventoryStats();
      }
    };
    
    // Update stats immediately when component mounts
    updateInventoryStats();
    
    // Listen for various events to update when returning from other pages
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Also set up a polling mechanism to catch any missed updates
    const interval = setInterval(updateInventoryStats, 2000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [inventories.length]); // Re-run when number of inventories changes

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Maintenance':
        return 'warning';
      case 'Inactive':
        return 'error';
      default:
        return 'default';
    }  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        if (isEdit) {
          setEditInventory({ ...editInventory, image: imageData });
        } else {
          setNewInventory({ ...newInventory, image: imageData });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (isEdit = false) => {
    if (isEdit) {
      setEditInventory({ ...editInventory, image: null });
    } else {
      setNewInventory({ ...newInventory, image: null });
    }
  };

  // Handle custom type creation
  const handleAddCustomType = () => {
    if (customTypeInput.trim() && !allTypes.includes(customTypeInput.trim())) {
      const newType = customTypeInput.trim();
      setCustomTypes([...customTypes, newType]);
      setNewInventory({ ...newInventory, type: newType });
      setCustomTypeInput('');
      setShowCustomTypeInput(false);
    }
  };

  const handleAddCustomTypeEdit = () => {
    if (customTypeInput.trim() && !allTypes.includes(customTypeInput.trim())) {
      const newType = customTypeInput.trim();
      setCustomTypes([...customTypes, newType]);
      setEditInventory({ ...editInventory, type: newType });
      setCustomTypeInput('');
      setShowCustomTypeInput(false);
    }
  };  const getTypeColor = (inventory: Inventory) => {
    // Use the inventory's avatar color for the type chip
    return inventory.color || 'primary';
  };  const handleCreateInventory = async () => {
    try {
      const payload = {
        name: newInventory.name,
        description: newInventory.description,
        type: newInventory.type,
        color: newInventory.color,
        image: newInventory.image,
      };
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/inventories`, payload);
      setInventories([...inventories, res.data]);
      setSnackbar({ open: true, message: 'Inventory created successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to create inventory.', severity: 'error' });
    }
    setNewInventory({ name: '', description: '', type: '', color: 'primary', image: null });
    setShowCustomTypeInput(false);
    setCustomTypeInput('');
    setOpenCreateDialog(false);
  };

  const handleViewInventory = (inventory: any) => {
    setSelectedInventory(inventory);
    setOpenViewDialog(true);
  };  const handleEditInventory = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setEditInventory({
      name: inventory.name,
      description: inventory.description,
      type: inventory.type,
      color: inventory.color || 'primary',
      image: inventory.image || null,
    });
    setOpenEditDialog(true);
  };
  const handleSaveEdit = async () => {
    if (!selectedInventory) return;
    try {
      const payload = {
        name: editInventory.name,
        description: editInventory.description,
        type: editInventory.type,
        color: editInventory.color,
        image: editInventory.image,
      };
      const res = await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/inventories/${selectedInventory.id}`, payload);
      setInventories(inventories.map((inv: Inventory) => inv.id === selectedInventory.id ? res.data : inv));
      setSnackbar({ open: true, message: 'Inventory updated successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to update inventory.', severity: 'error' });
    }
    setShowCustomTypeInput(false);
    setCustomTypeInput('');
    setOpenEditDialog(false);
    setSelectedInventory(null);
  };
  const handleDeleteInventory = (inventory: Inventory) => {
    setSelectedInventory(inventory);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInventory) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/inventories/${selectedInventory.id}`);
      setInventories(inventories.filter((inv: Inventory) => inv.id !== selectedInventory.id));
      setSnackbar({ open: true, message: 'Inventory deleted successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete inventory.', severity: 'error' });
    }
    setOpenDeleteDialog(false);
    setSelectedInventory(null);
  };

  const handleManageItems = (inventory: Inventory) => {
    // Navigate to the inventory item management page
    navigate(`/inventory/${inventory.id}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InventoryIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory Management
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Create and manage your inventory locations and storage facilities
        </Typography>
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
          <Box sx={{ flexGrow: 1 }} />          <Button
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
        </Box>      </Paper>

      {/* Inventory Display - Grid or List View */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <Grid container spacing={3}>
          {inventories.map((inventory: Inventory) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={inventory.id}>
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
              >                {/* Inventory Header */}                <Box
                  sx={{
                    height: 180,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    flexDirection: 'column',
                    p: 2,
                    ...(inventory.image ? {
                      backgroundImage: `url(${inventory.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    } : {}),
                  }}
                >
                  {!inventory.image && (
                    <>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: inventory.color + '.main',
                          fontSize: '1.5rem',
                          mb: 1,
                        }}
                      >
                        {inventory.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" color="text.secondary" align="center">
                        {inventory.name}
                      </Typography>
                    </>
                  )}
                  {inventory.image && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Typography variant="body2" color="white" align="center">
                        {inventory.name}
                      </Typography>
                    </Box>
                  )}
                  <Chip
                    label={inventory.status}
                    color={getStatusColor(inventory.status) as any}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Removed duplicate inventory name */}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {inventory.description}
                  </Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>                    <Chip
                      label={inventory.type}
                      color={getTypeColor(inventory) as any}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Items
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {inventory.itemCount}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Value
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {inventory.totalValue}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Last updated: {inventory.lastUpdated}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleViewInventory(inventory)}
                    title="View Details"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="secondary"
                    onClick={() => handleEditInventory(inventory)}
                    title="Edit Inventory"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteInventory(inventory)}
                    title="Delete Inventory"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    sx={{ ml: 1 }}
                    onClick={() => handleManageItems(inventory)}
                  >
                    Manage Items
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* List View */
        <Paper>
          <List>
            {inventories.map((inventory: Inventory, index: number) => (
              <React.Fragment key={inventory.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >                  <Avatar
                    sx={{
                      bgcolor: inventory.image ? 'transparent' : inventory.color + '.main',
                      mr: 2,
                      ...(inventory.image ? {
                        backgroundImage: `url(${inventory.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : {}),
                    }}
                  >
                    {!inventory.image && inventory.name.charAt(0)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" component="span">
                          {inventory.name}
                        </Typography>                        <Chip
                          label={inventory.type}
                          color={getTypeColor(inventory) as any}
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={inventory.status}
                          color={getStatusColor(inventory.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {inventory.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Items:</strong> {inventory.itemCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Value:</strong> {inventory.totalValue}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Updated:</strong> {inventory.lastUpdated}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleViewInventory(inventory)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="secondary"
                        onClick={() => handleEditInventory(inventory)}
                        title="Edit Inventory"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteInventory(inventory)}
                        title="Delete Inventory"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleManageItems(inventory)}
                        sx={{ ml: 1 }}
                      >
                        Manage Items
                      </Button>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < inventories.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}{/* Summary Stats */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Inventory Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {inventories.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Inventories
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {inventories.filter((inv: Inventory) => inv.status === 'Active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {inventories.filter((inv: Inventory) => inv.status === 'Maintenance').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Maintenance
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {inventories.reduce((sum: number, inv: Inventory) => sum + inv.itemCount, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add inventory"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setOpenCreateDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Inventory Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Inventory</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Inventory Name"
              value={newInventory.name}
              onChange={(e) => setNewInventory({ ...newInventory, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={newInventory.description}
              onChange={(e) => setNewInventory({ ...newInventory, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={newInventory.type}
                label="Category"
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomTypeInput(true);
                  } else {
                    setNewInventory({ ...newInventory, type: e.target.value });
                  }
                }}
              >
                {allTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
                <MenuItem value="custom">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon fontSize="small" />
                    Add Custom Type
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            {showCustomTypeInput && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Custom Type Name"
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomType();
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddCustomType}
                  disabled={!customTypeInput.trim()}
                >
                  Add
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowCustomTypeInput(false);
                    setCustomTypeInput('');
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
            
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Avatar Color</FormLabel>
              <RadioGroup
                row
                value={newInventory.color}
                onChange={(e) => setNewInventory({ ...newInventory, color: e.target.value })}
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="primary"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }} />
                      Blue
                    </Box>
                  }
                />
                <FormControlLabel
                  value="secondary"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 24, height: 24 }} />
                      Purple
                    </Box>
                  }
                />
                <FormControlLabel
                  value="success"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }} />
                      Green
                    </Box>
                  }
                />
                <FormControlLabel
                  value="warning"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 24, height: 24 }} />
                      Orange
                    </Box>
                  }
                />
                <FormControlLabel
                  value="error"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'error.main', width: 24, height: 24 }} />
                      Red
                    </Box>
                  }
                />
                <FormControlLabel
                  value="info"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }} />
                      Cyan
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Inventory Image</FormLabel>
              <Box sx={{ mt: 2 }}>
                {newInventory.image ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={newInventory.image}
                      alt="Inventory preview"
                      style={{
                        width: '200px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(false)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                  </Button>
                )}
                <Typography variant="caption" display="block" color="text.secondary">
                  Upload an image to replace the avatar. Recommended size: 200x120 pixels.
                </Typography>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateInventory}
            variant="contained"
            disabled={!newInventory.name || !newInventory.type}
          >
            Create Inventory
          </Button>
        </DialogActions>      </Dialog>

      {/* View Inventory Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Inventory Details</DialogTitle>
        <DialogContent>
          {selectedInventory && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedInventory.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedInventory.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>                  <Chip 
                    label={selectedInventory.type} 
                    color={getTypeColor(selectedInventory) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Items Count
                  </Typography>
                  <Typography variant="body1">
                    {selectedInventory.itemCount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Value
                  </Typography>
                  <Typography variant="body1">
                    {selectedInventory.totalValue}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={selectedInventory.status} 
                    color={getStatusColor(selectedInventory.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {selectedInventory.lastUpdated}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              setOpenViewDialog(false);
              if (selectedInventory) handleEditInventory(selectedInventory);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Inventory</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Inventory Name"
              value={editInventory.name}
              onChange={(e) => setEditInventory({ ...editInventory, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={editInventory.description}
              onChange={(e) => setEditInventory({ ...editInventory, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={editInventory.type}
                label="Category"
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomTypeInput(true);
                  } else {
                    setEditInventory({ ...editInventory, type: e.target.value });
                  }
                }}
              >
                {allTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
                <MenuItem value="custom">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon fontSize="small" />
                    Add Custom Type
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            {showCustomTypeInput && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Custom Type Name"
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomTypeEdit();
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddCustomTypeEdit}
                  disabled={!customTypeInput.trim()}
                >
                  Add
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowCustomTypeInput(false);
                    setCustomTypeInput('');
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
            
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Avatar Color</FormLabel>
              <RadioGroup
                row
                value={editInventory.color}
                onChange={(e) => setEditInventory({ ...editInventory, color: e.target.value })}
                sx={{ mt: 1 }}
              >
                <FormControlLabel
                  value="primary"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }} />
                      Blue
                    </Box>
                  }
                />
                <FormControlLabel
                  value="secondary"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 24, height: 24 }} />
                      Purple
                    </Box>
                  }
                />
                <FormControlLabel
                  value="success"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }} />
                      Green
                    </Box>
                  }
                />
                <FormControlLabel
                  value="warning"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 24, height: 24 }} />
                      Orange
                    </Box>
                  }
                />
                <FormControlLabel
                  value="error"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'error.main', width: 24, height: 24 }} />
                      Red
                    </Box>
                  }
                />
                <FormControlLabel
                  value="info"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }} />
                      Cyan
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Inventory Image</FormLabel>
              <Box sx={{ mt: 2 }}>
                {editInventory.image ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={editInventory.image}
                      alt="Inventory preview"
                      style={{
                        width: '200px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(true)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                  </Button>
                )}
                <Typography variant="caption" display="block" color="text.secondary">
                  Upload an image to replace the avatar. Recommended size: 200x120 pixels.
                </Typography>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editInventory.name || !editInventory.type}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Inventory</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedInventory?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All items in this inventory will need to be relocated.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Catalog;
