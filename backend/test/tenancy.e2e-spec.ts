import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { RegisterDto } from '../src/modules/auth/dto/register.dto';
import { LoginDto } from '../src/modules/auth/dto/login.dto';

describe('Multi-Tenancy Isolation (e2e)', () => {
    let app: INestApplication;
    let tenantAToken: string;
    let tenantBToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // 1. Register User A (Tenant A)
        const registerA: RegisterDto = {
            email: `user-a-${Date.now()}@test.com`,
            password: 'password123',
            firstName: 'User',
            lastName: 'A',
            tenantName: `Tenant A ${Date.now()}`
        };

        await request(app.getHttpServer())
            .post('/auth/register')
            .send(registerA)
            .expect(201);

        const loginA: LoginDto = { email: registerA.email, password: registerA.password };
        const resA = await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginA)
            .expect(200);

        tenantAToken = resA.body.accessToken;

        // 2. Register User B (Tenant B)
        const registerB: RegisterDto = {
            email: `user-b-${Date.now()}@test.com`,
            password: 'password123',
            firstName: 'User',
            lastName: 'B',
            tenantName: `Tenant B ${Date.now()}`
        };

        await request(app.getHttpServer())
            .post('/auth/register')
            .send(registerB)
            .expect(201);

        const loginB: LoginDto = { email: registerB.email, password: registerB.password };
        const resB = await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginB)
            .expect(200);

        tenantBToken = resB.body.accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    it('should allow Tenant A to see its own data', async () => {
        // Verify connection first
        await request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', `Bearer ${tenantAToken}`)
            .expect(200);
    });

    it('should NOT allow Tenant B to see Tenant A data', async () => {
        // Setup: Create campaign in Tenant A
        // Note: This requires a campaign endpoint that allows creation. 
        // Assuming for now we test with user listing since that's easier to verify isolation.

        const usersA = await request(app.getHttpServer())
            .get('/users')
            .set('Authorization', `Bearer ${tenantAToken}`)
            .expect(200);

        const usersB = await request(app.getHttpServer())
            .get('/users')
            .set('Authorization', `Bearer ${tenantBToken}`)
            .expect(200);

        // Verify User A sees User A
        const userAInListA = usersA.body.users.find((u: any) => u.email.includes('user-a'));
        expect(userAInListA).toBeDefined();

        // Verify User B does NOT see User A
        const userAInListB = usersB.body.users.find((u: any) => u.email.includes('user-a'));
        expect(userAInListB).toBeUndefined();

        // Verify User B sees User B
        const userBInListB = usersB.body.users.find((u: any) => u.email.includes('user-b'));
        expect(userBInListB).toBeDefined();
    });
});
