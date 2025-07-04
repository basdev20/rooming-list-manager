const dataService = require('../services/dataService');

const handle = (fn) => (req, res) =>
  fn(req, res).catch(err =>
    res.status(500).json({ error: err.message || 'Internal server error' })
  );

module.exports = {
  getStatus: handle(async (_, res) => {
    const data = await dataService.getStatus();
    res.json({ status: 'success', data });
  }),

  insert: handle(async (_, res) => {
    const data = await dataService.insertData();
    res.json({
      status: 'success',
      message: 'Data inserted successfully from JSON files',
      data
    });
  }),

  clear: handle(async (_, res) => {
    await dataService.clearData();
    res.json({
      status: 'success',
      message: 'All data cleared successfully'
    });
  })
};
