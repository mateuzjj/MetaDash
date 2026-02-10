import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class AddMultiTenantSupport1707523200000 implements MigrationInterface {
    name = 'AddMultiTenantSupport1707523200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ==========================================
        // 1. Create tenants table
        // ==========================================
        await queryRunner.createTable(
            new Table({
                name: 'tenants',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    { name: 'name', type: 'varchar', isUnique: true },
                    { name: 'subdomain', type: 'varchar', isNullable: true, isUnique: true },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['active', 'suspended', 'trial', 'cancelled'],
                        default: "'trial'",
                    },
                    {
                        name: 'plan',
                        type: 'enum',
                        enum: ['free', 'starter', 'professional', 'enterprise'],
                        default: "'free'",
                    },
                    { name: 'trial_ends_at', type: 'timestamp', isNullable: true },
                    { name: 'subscription_ends_at', type: 'timestamp', isNullable: true },
                    { name: 'settings', type: 'jsonb', default: "'{}'" },
                    { name: 'logo_url', type: 'varchar', isNullable: true },
                    { name: 'primary_color', type: 'varchar', isNullable: true },
                    { name: 'contact_email', type: 'varchar', isNullable: true },
                    { name: 'billing_email', type: 'varchar', isNullable: true },
                    { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            true,
        );

        // ==========================================
        // 2. Create default tenant
        // ==========================================
        await queryRunner.query(`
      INSERT INTO tenants (id, name, subdomain, status, plan, settings)
      VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'Default Organization',
        'default',
        'active',
        'enterprise',
        '{"timezone":"America/Sao_Paulo","currency":"BRL","language":"pt-BR","features":[],"limits":{"users":100,"connectors":50,"dataRetentionDays":730}}'
      )
    `);

        // ==========================================
        // 3. Add tenant_id to all tables (nullable first)
        // ==========================================
        const tables = ['users', 'user_connectors', 'campaigns', 'raw_events', 'kpi_values'];

        for (const table of tables) {
            // Check if column already exists
            const hasColumn = await queryRunner.hasColumn(table, 'tenant_id');
            if (!hasColumn) {
                await queryRunner.query(
                    `ALTER TABLE "${table}" ADD COLUMN "tenant_id" uuid`,
                );
            }
        }

        // ==========================================
        // 4. Populate tenant_id with default tenant
        // ==========================================
        for (const table of tables) {
            await queryRunner.query(
                `UPDATE "${table}" SET tenant_id = 'a0000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL`,
            );
        }

        // ==========================================
        // 5. Make tenant_id NOT NULL
        // ==========================================
        for (const table of tables) {
            await queryRunner.query(
                `ALTER TABLE "${table}" ALTER COLUMN "tenant_id" SET NOT NULL`,
            );
        }

        // ==========================================
        // 6. Create indexes
        // ==========================================
        for (const table of tables) {
            await queryRunner.createIndex(
                table,
                new TableIndex({
                    name: `idx_${table}_tenant_id`,
                    columnNames: ['tenant_id'],
                }),
            );
        }

        // Additional composite indexes
        await queryRunner.createIndex(
            'campaigns',
            new TableIndex({
                name: 'idx_campaigns_tenant_source_external',
                columnNames: ['tenant_id', 'source', 'external_id'],
                isUnique: true,
            }),
        );

        await queryRunner.createIndex(
            'raw_events',
            new TableIndex({
                name: 'idx_raw_events_tenant_source_received',
                columnNames: ['tenant_id', 'source', 'received_at'],
            }),
        );

        await queryRunner.createIndex(
            'raw_events',
            new TableIndex({
                name: 'idx_raw_events_tenant_processed',
                columnNames: ['tenant_id', 'processed'],
            }),
        );

        await queryRunner.createIndex(
            'kpi_values',
            new TableIndex({
                name: 'idx_kpi_values_tenant_kpi_connector_date',
                columnNames: ['tenant_id', 'kpi_definition_id', 'connector_id', 'date', 'granularity'],
                isUnique: true,
            }),
        );

        // ==========================================
        // 7. Add foreign keys
        // ==========================================
        for (const table of tables) {
            await queryRunner.createForeignKey(
                table,
                new TableForeignKey({
                    name: `fk_${table}_tenant`,
                    columnNames: ['tenant_id'],
                    referencedTableName: 'tenants',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );
        }

        // ==========================================
        // 8. Update users email uniqueness (tenant-scoped)
        // ==========================================
        // Drop old unique index on email
        try {
            await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_email"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "UQ_97672ac88f789774dd47f7c8be3"`); // TypeORM auto-generated
        } catch (e) {
            // Ignore if not exists
        }

        // Create tenant-scoped unique index on email
        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'idx_users_tenant_email',
                columnNames: ['tenant_id', 'email'],
                isUnique: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tables = ['users', 'user_connectors', 'campaigns', 'raw_events', 'kpi_values'];

        // Remove foreign keys
        for (const table of tables) {
            try {
                await queryRunner.dropForeignKey(table, `fk_${table}_tenant`);
            } catch (e) { /* ignore */ }
        }

        // Remove indexes
        const indexes = [
            { table: 'users', name: 'idx_users_tenant_email' },
            { table: 'campaigns', name: 'idx_campaigns_tenant_source_external' },
            { table: 'raw_events', name: 'idx_raw_events_tenant_source_received' },
            { table: 'raw_events', name: 'idx_raw_events_tenant_processed' },
            { table: 'kpi_values', name: 'idx_kpi_values_tenant_kpi_connector_date' },
        ];

        for (const idx of indexes) {
            try {
                await queryRunner.dropIndex(idx.table, idx.name);
            } catch (e) { /* ignore */ }
        }

        for (const table of tables) {
            try {
                await queryRunner.dropIndex(table, `idx_${table}_tenant_id`);
            } catch (e) { /* ignore */ }
        }

        // Remove tenant_id columns
        for (const table of tables) {
            try {
                await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "tenant_id"`);
            } catch (e) { /* ignore */ }
        }

        // Restore original email unique constraint
        try {
            await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")`);
        } catch (e) { /* ignore */ }

        // Drop tenants table
        await queryRunner.dropTable('tenants', true);
    }
}
