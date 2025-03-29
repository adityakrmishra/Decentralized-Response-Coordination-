import { AllocationService } from '../services/allocation.service.js';
import { validateResourceRequest } from '../validators/allocation.validator.js';
import logger from '../utils/logger.js';

export class AllocationController {
  static async allocateResources(req, res) {
    try {
      const { disasterId, resourceType, quantity } = req.body;
      
      await validateResourceRequest.validateAsync({
        disasterId,
        resourceType,
        quantity
      });

      const txHash = await AllocationService.allocateResources(
        disasterId,
        resourceType,
        quantity,
        req.user.walletAddress
      );

      logger.info(`Resources allocated - TX: ${txHash}`);
      res.json({
        success: true,
        txHash,
        message: 'Allocation transaction submitted'
      });
      
    } catch (error) {
      logger.error(`Allocation error: ${error.message}`);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getResourceStatus(req, res) {
    try {
      const { resourceId } = req.params;
      const status = await AllocationService.getResourceStatus(resourceId);
      
      res.json({
        resourceId,
        status: AllocationService.STATUS_MAP[status],
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(404).json({ error: 'Resource not found' });
    }
  }

  static async updateDeliveryStatus(req, res) {
    try {
      const { resourceId } = req.params;
      const { status, location } = req.body;

      const txHash = await AllocationService.updateDeliveryStatus(
        resourceId,
        status,
        location,
        req.user.walletAddress
      );

      res.json({
        success: true,
        txHash,
        message: 'Delivery status updated'
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
