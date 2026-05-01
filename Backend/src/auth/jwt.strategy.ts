import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const tenantId = configService.get<string>('AZURE_TENANT_ID');
    const clientId = configService.get<string>('AZURE_CLIENT_ID');

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: clientId,
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any): Promise<User> {
    // Azure V2 token claims: 'email' (o 'upn'), 'name', 'preferred_username'
    const email = payload.email || payload.upn || payload.preferred_username;
    const name = payload.name || payload.preferred_username || email.split('@')[0];

    if (!email) {
      throw new UnauthorizedException('Token does not contain email claim');
    }

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Auto-registrazione dell'utente al primo login con Microsoft
      user = this.userRepository.create({
        email,
        username: name,
        password: 'ENTRA_ID_USER', // Placeholder per compatibilità con il DB
      });
      await this.userRepository.save(user);
    }

    return user;
  }
}
