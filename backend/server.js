const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Import API inventory
const inventoryAPI = require('./api');
app.use('/api', inventoryAPI);

app.listen(PORT, () => {
  console.log(`POS server running at http://localhost:${PORT}`);
});
