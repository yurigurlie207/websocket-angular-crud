import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

interface Payload {
  username: string;
  password: string;
}

type Callback = (response: { data?: any; error?: string }) => void;


const users = new Map(); // username -> { passwordHash }

export const register = (socket: Socket, payload: Payload, callback: Callback) => {
  const { username, password } = payload;
  if (users.has(username)) return callback({ error: 'User exists' });
  const passwordHash = bcrypt.hashSync(password, 10);
  users.set(username, { passwordHash });
  callback({ data: 'Registered' });
};

export const login = (socket: Socket, payload: Payload, callback: Callback) => {
  const { username, password } = payload;
  const user = users.get(username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return callback({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, 'SECRET_KEY');
  callback({ data: { token } });
};