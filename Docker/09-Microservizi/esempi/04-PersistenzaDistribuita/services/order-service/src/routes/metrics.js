const express = require('express')
const metrics = require('../utils/metrics')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType)
    const metricsOutput = await metrics.register.metrics()
    res.send(metricsOutput)
  } catch (error) {
    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error.message
    })
  }
})

module.exports = router
