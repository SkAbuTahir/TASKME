# MongoDB to PostgreSQL Migration Guide

## Overview
This guide will help you migrate your TaskMe application from MongoDB to PostgreSQL using Prisma.

## Prerequisites
- Node.js installed
- PostgreSQL database (Render.com setup completed)
- Environment variables configured

## Migration Steps

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Push Database Schema
This will create the tables in your PostgreSQL database:
```bash
npm run db:push
```

### 4. Seed Initial Data (Optional)
To populate your database with sample data:
```bash
npm run db:seed
```

### 5. Start the Server
```bash
npm start
```

## Database Schema Changes

### User Model
- MongoDB `_id` → PostgreSQL `id` (cuid)
- Added proper constraints and relationships
- Password hashing handled in application layer

### Task Model
- MongoDB `_id` → PostgreSQL `id` (cuid)
- Activities moved to separate table with foreign key
- SubTasks moved to separate table with foreign key
- Many-to-many relationship with Users through junction table

### New Tables
- `activities` - Task activities with user references
- `sub_tasks` - Task subtasks with proper relationships

## Environment Variables
Updated `.env` file with PostgreSQL connection:
```
DATABASE_URL="postgresql://taskme_user:VYApORK2sA5TyVSNeJ1zXAV5VtA78v2s@dpg-d5fng13uibrs73e01jlg-a.singapore-postgres.render.com/taskme"
JWT_SECRET=your_jwt_secret
PORT=8800
NODE_ENV=development
```

## API Changes
- All MongoDB ObjectIds replaced with Prisma cuid strings
- Mongoose populate() replaced with Prisma include
- MongoDB queries converted to Prisma syntax
- Error handling updated for Prisma exceptions

## Testing
1. Register a new user at `/api/user/register`
2. Login at `/api/user/login`
3. Create tasks at `/api/task/create`
4. Verify data persistence in PostgreSQL

## Rollback Plan
If you need to rollback to MongoDB:
1. Restore the original `.env` file
2. Restore the original model files
3. Restore the original controller files
4. Run `npm install mongoose`

## Troubleshooting

### Common Issues
1. **Connection Error**: Verify DATABASE_URL is correct
2. **Schema Sync Issues**: Run `npm run db:push` again
3. **Missing Tables**: Ensure Prisma schema is properly defined

### Useful Commands
```bash
# View database schema
npx prisma studio

# Reset database (careful!)
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name migration_name
```

## Performance Considerations
- PostgreSQL provides better performance for complex queries
- Proper indexing on frequently queried fields
- Connection pooling handled by Prisma
- Better transaction support

## Security Improvements
- Parameterized queries prevent SQL injection
- Better data validation with Prisma schema
- Proper foreign key constraints
- Row-level security can be implemented

## Next Steps
1. Test all application features
2. Monitor performance
3. Set up database backups
4. Consider implementing database migrations for future schema changes