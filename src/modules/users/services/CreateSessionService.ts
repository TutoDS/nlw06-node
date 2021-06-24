import { AppError } from 'shared/errors/AppError';
import { compare } from 'bcryptjs';
import { classToClass } from 'class-transformer';
import { authEnv } from 'configs/envConfig';
import { sign } from 'jsonwebtoken';
import { AuthSessionType } from 'modules/users/types/Auth';
import { BaseUserService } from './BaseUserService';

type Request = {
	email: string;
	password: string;
};

class CreateSessionService extends BaseUserService {
	public async execute({
		email,
		password
	}: Request): Promise<AuthSessionType> {
		const user = await this.repository.findByEmail(email);

		if (!user) {
			throw new AppError('Email or password incorrect!', 401);
		}

		const confirmed = await compare(password, user.password);

		if (!confirmed) {
			throw new AppError('Email or password incorrect!', 401);
		}

		const token = sign({ user: classToClass(user) }, authEnv.secret, {
			subject: user.id,
			expiresIn: authEnv.expires
		});

		return {
			code: 200,
			message: 'User logged with success!',
			token,
			user
		};
	}
}

export { CreateSessionService };
