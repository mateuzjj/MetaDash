import { Test, TestingModule } from '@nestjs/testing';
import { EtlService } from './etl.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RawEvent, EventSource } from '../../entities/raw-event.entity';
import { KpiValue } from '../../entities/kpi-value.entity';
import { UserConnector } from '../../entities/user-connector.entity';
import { Tenant } from '../../entities/tenant.entity';

describe('EtlService', () => {
    let service: EtlService;

    const mockRawEventRepo = {
        find: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    };

    const mockKpiValueRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getRawOne: jest.fn(),
        })),
    };

    const mockConnectorRepo = {
        find: jest.fn(),
        save: jest.fn(),
    };

    const mockTenantRepo = {
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EtlService,
                { provide: getRepositoryToken(RawEvent), useValue: mockRawEventRepo },
                { provide: getRepositoryToken(KpiValue), useValue: mockKpiValueRepo },
                { provide: getRepositoryToken(UserConnector), useValue: mockConnectorRepo },
                { provide: getRepositoryToken(Tenant), useValue: mockTenantRepo },
            ],
        }).compile();

        service = module.get<EtlService>(EtlService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processRawEvents', () => {
        it('should transform GA4 raw event to KPI values', async () => {
            const tenantId = 'tenant-123';
            const event: RawEvent = {
                id: 'evt-1',
                tenantId,
                source: EventSource.GOOGLE_ANALYTICS,
                connectorId: 'conn-1',
                receivedAt: new Date(),
                eventTime: new Date(),
                payload: {
                    sessions: 100,
                    pageViews: 200,
                },
                processed: false,
                externalId: 'ext-1',
                eventType: 'page_view',
                processedAt: null,
                processingError: null,
                createdAt: new Date(),
            } as RawEvent;

            mockRawEventRepo.find.mockResolvedValue([event]);
            mockKpiValueRepo.findOne.mockResolvedValue(null); // No existing KPI
            mockKpiValueRepo.create.mockImplementation(dto => dto);
            mockKpiValueRepo.save.mockResolvedValue({} as any);

            const result = await service.processRawEvents(tenantId);

            expect(result.processedCount).toBe(1);
            expect(result.errorCount).toBe(0);

            // Should save Sessions and PageViews
            expect(mockKpiValueRepo.save).toHaveBeenCalledTimes(3); // 2 KPIs + 1 Event update
            expect(mockKpiValueRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                kpiDefinitionId: 'sessions',
                value: 100,
            }));
            expect(mockKpiValueRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                kpiDefinitionId: 'pageViews',
                value: 200,
            }));
        });

        it('should be idempotent (update existing KPI)', async () => {
            const tenantId = 'tenant-123';
            const event: RawEvent = {
                id: 'evt-1',
                tenantId,
                source: EventSource.GOOGLE_ANALYTICS,
                connectorId: 'conn-1',
                receivedAt: new Date(),
                eventTime: new Date(),
                payload: { sessions: 100 },
                processed: false,
                externalId: 'ext-1',
                eventType: 'session_start',
                processedAt: null,
                processingError: null,
                createdAt: new Date(),
            } as RawEvent;

            mockRawEventRepo.find.mockResolvedValue([event]);

            // Mock existing KPI
            const existingKpi = {
                id: 'kpi-1',
                value: 50,
                previousValue: 0,
            };
            mockKpiValueRepo.findOne.mockResolvedValue(existingKpi);

            await service.processRawEvents(tenantId);

            expect(mockKpiValueRepo.save).toHaveBeenCalledWith(expect.objectContaining({
                id: 'kpi-1',
                value: 100,
                previousValue: 50, // Updated previous value
            }));
        });
    });
});
