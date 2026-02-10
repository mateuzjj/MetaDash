import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('google.clientId');
    const clientSecret = configService.get<string>('google.clientSecret');

    super({
      clientID: clientID || 'MISSING_GOOGLE_CLIENT_ID',
      clientSecret: clientSecret || 'MISSING_GOOGLE_CLIENT_SECRET',
      callbackURL: configService.get('google.redirectUri'),
      scope: configService.get('google.scopes'),
    });

    if (!clientID || !clientSecret) {
      console.warn('WARNING: Google OAuth credentials are missing. Google login will not work.');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;

    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
