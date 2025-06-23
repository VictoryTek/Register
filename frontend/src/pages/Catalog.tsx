import React from 'react';
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
} from '@mui/material';
import {
  MenuBook as CatalogIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';

const Catalog: React.FC = () => {
  // Sample catalog data - this would typically come from an API
  const catalogItems = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      price: '$299.99',
      description: 'High-quality wireless headphones with noise cancellation.',
      availability: 'In Stock',
      image: null,
    },
    {
      id: 2,
      name: 'Ergonomic Office Chair',
      category: 'Furniture',
      price: '$449.99',
      description: 'Comfortable office chair with lumbar support.',
      availability: 'Limited Stock',
      image: null,
    },
    {
      id: 3,
      name: 'Professional Notebook Set',
      category: 'Office Supplies',
      price: '$24.99',
      description: 'Set of 5 premium notebooks for professional use.',
      availability: 'In Stock',
      image: null,
    },
    {
      id: 4,
      name: 'Wireless Keyboard & Mouse',
      category: 'Electronics',
      price: '$89.99',
      description: 'Wireless keyboard and mouse combo with long battery life.',
      availability: 'Out of Stock',
      image: null,
    },
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'In Stock':
        return 'success';
      case 'Limited Stock':
        return 'warning';
      case 'Out of Stock':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CatalogIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Product Catalog
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Browse our complete product catalog and manage items
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
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<ViewListIcon />}
            size="small"
          >
            List View
          </Button>
          <Button
            variant="contained"
            startIcon={<ViewModuleIcon />}
            size="small"
          >
            Grid View
          </Button>
        </Box>
      </Paper>

      {/* Catalog Grid */}
      <Grid container spacing={3}>
        {catalogItems.map((item) => (
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
              {/* Product Image Placeholder */}
              <Box
                sx={{
                  height: 200,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {item.name.charAt(0)}
                </Avatar>
                <Chip
                  label={item.availability}
                  color={getAvailabilityColor(item.availability) as any}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.description}
                </Typography>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Chip
                    label={item.category}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
                <Typography variant="h6" color="primary.main" sx={{ mt: 2 }}>
                  {item.price}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button size="small" variant="outlined" fullWidth>
                  View Details
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  disabled={item.availability === 'Out of Stock'}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Summary Stats */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Catalog Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {catalogItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {catalogItems.filter(item => item.availability === 'In Stock').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Stock
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {catalogItems.filter(item => item.availability === 'Limited Stock').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Limited Stock
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {catalogItems.filter(item => item.availability === 'Out of Stock').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of Stock
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Catalog;
