import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication Flow (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should register a new user AND create a new tenant', async () => {
        const tenantName = `AutoTest Tenant ${Date.now()}`;
        const email = `admin-${Date.now()}@test.com`;

        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email,
                password: 'password123',
                firstName: 'Admin',
                lastName: 'User',
                tenantName,
            })
            .expect(201);

        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(email);
        expect(res.body.user.role).toBe('admin'); // Creator should be admin
        expect(res.body.accessToken).toBeDefined();

        // Verify tenant creation via login context
        const loginRes = await request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', `Bearer ${res.body.accessToken}`)
            .expect(200);

        expect(loginRes.body.tenant).toBeDefined();
        expect(loginRes.body.tenant.name).toBe(tenantName);
    });

    it('should login and return a valid JWT', async () => {
        // Basic login with credentials from previous test (if we shared state)
        // Or create new user
        const email = `login-test-${Date.now()}@test.com`;
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email,
                password: 'password123',
                firstName: 'Login',
                lastName: 'Test',
            })
            .expect(201);

        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email,
                password: 'password123',
            })
            .expect(200);

        expect(res.body.accessToken).toBeDefined();
    });
});
