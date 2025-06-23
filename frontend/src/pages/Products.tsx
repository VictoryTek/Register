import React from 'react';
import { Box, Typography } from '@mui/material';

const Products: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>
      <Typography variant="body1">
        Product management interface will be implemented here.
      </Typography>
    </Box>
  );
};

export default Products;
