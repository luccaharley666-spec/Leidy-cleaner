import ServiceService from '../services/ServiceService';
import * as database from '../utils/database';

// Mock dependencies
jest.mock('../utils/database');

describe('ServiceService', () => {
  const mockQuery = database.query as jest.MockedFunction<typeof database.query>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all services with pagination', async () => {
      const services = [
        {
          id: 1,
          name: 'Limpeza Residencial',
          description: 'Limpeza completa de residências',
          category: 'Residencial',
          base_price: 150.00,
          duration_minutes: 120,
          is_active: true
        },
        {
          id: 2,
          name: 'Limpeza Comercial',
          description: 'Limpeza de escritórios',
          category: 'Comercial',
          base_price: 250.00,
          duration_minutes: 150,
          is_active: true
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: services });

      const result = await ServiceService.getAll({
        limit: 10,
        offset: 0,
        category: undefined,
        search: undefined
      });

      expect(mockQuery).toHaveBeenCalled();
      expect(result).toEqual(services);
    });

    it('should filter services by category', async () => {
      const services = [
        {
          id: 1,
          name: 'Limpeza Residencial',
          category: 'Residencial',
          base_price: 150.00,
          duration_minutes: 120,
          is_active: true
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: services });

      const result = await ServiceService.getAll({
        limit: 10,
        offset: 0,
        category: 'Residencial',
        search: undefined
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.anything()
      );
      expect(result).toEqual(services);
    });

    it('should search services by name', async () => {
      const services = [
        {
          id: 1,
          name: 'Limpeza Residencial',
          category: 'Residencial',
          base_price: 150.00,
          duration_minutes: 120,
          is_active: true
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: services });

      const result = await ServiceService.getAll({
        limit: 10,
        offset: 0,
        category: undefined,
        search: 'Limpeza'
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.anything()
      );
      expect(result).toEqual(services);
    });
  });

  describe('getById', () => {
    it('should return service by id', async () => {
      const service = {
        id: 1,
        name: 'Limpeza Residencial',
        description: 'Limpeza completa de residências',
        category: 'Residencial',
        base_price: 150.00,
        duration_minutes: 120,
        is_active: true
      };

      mockQuery.mockResolvedValueOnce({ rows: [service] });

      const result = await ServiceService.getById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id'),
        [1]
      );
      expect(result).toEqual(service);
    });

    it('should return null if service not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await ServiceService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new service', async () => {
      const serviceData = {
        name: 'Novo Serviço',
        description: 'Descrição do serviço',
        category: 'Novo',
        base_price: 100.00,
        duration_minutes: 60
      };

      const newService = {
        id: 3,
        ...serviceData,
        is_active: true
      };

      mockQuery.mockResolvedValueOnce({ rows: [newService] });

      const result = await ServiceService.create(
        serviceData.name,
        serviceData.category,
        serviceData.base_price,
        serviceData.duration_minutes,
        serviceData.description
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        expect.anything()
      );
      expect(result).toEqual(newService);
    });
  });

  describe('update', () => {
    it('should update service', async () => {
      const serviceData = {
        name: 'Limpeza Residencial Atualizada',
        base_price: 200.00
      };

      const updatedService = {
        id: 1,
        name: serviceData.name,
        description: 'Descrição',
        category: 'Residencial',
        base_price: serviceData.base_price,
        duration_minutes: 120,
        is_active: true
      };

      mockQuery.mockResolvedValueOnce({ rows: [updatedService] });

      const result = await ServiceService.update(1, {
        name: serviceData.name,
        base_price: serviceData.base_price
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.anything()
      );
      expect(result).toEqual(updatedService);
    });
  });

  describe('delete', () => {
    it('should soft-delete service', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const result = await ServiceService.delete(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        expect.anything()
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw error if service not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = ServiceService.delete(999);

      await expect(result).rejects.toThrow();
    });
  });

  describe('getCategories', () => {
    it('should return all service categories', async () => {
      const categories = [
        { category: 'Residencial' },
        { category: 'Comercial' },
        { category: 'Pós-Obra' },
        { category: 'Especializada' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: categories });

      const result = await ServiceService.getCategories();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DISTINCT')
      );
      expect(result).toEqual(categories.map(c => c.category));
    });
  });
});
