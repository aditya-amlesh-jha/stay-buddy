# Stay Buddy
Backend for room booking 

# Features
1. Handled race condition while booking rooms
2. Server side pagination to handle traffic
3. Added JWT based authentication and password salting for security
4. Added rate limiter to avoid multiple requests from same ip
5. Used REST API to handle different request
6. Added separate features for admin and user, ensuring functionality

# Technologies
Backend - Node.js, Express.js
Database - MongoDB
Authentication - JWT

# Steps for installation
Step 1 : Clone the repo :: git clone https://github.com/aditya-amlesh-jha/stay-buddy.git
Step 2 : Make .env file in server directory :: touch .env
Step 3 : Add key, value config in .env file
SERVER_PORT=8080
MONGODB_URI=your_mongodb_uri
TOKEN_SECRET=your_token_secret
USER_MODEL=your_user_model
BOOKING_MODEL=your_booking_model
ROOM_MODEL=your_room_model
Step 4 : Run command in server directory to start server :: yarn dev

# Concepts Used To Avoid Race Condition
When two transactions attempt to book the same room for overlapping dates simultaneously, MongoDB's transaction mechanism will help manage the race condition.

Document-Level Locking:
MongoDB uses a document-level locking mechanism within a transaction. When a transaction reads a document, it locks that document until the transaction is either committed or aborted. If two transactions try to read or write to the same document concurrently, one transaction will proceed while the other will wait until the first transaction completes.

Conflict Detection:
When the first transaction checks for conflicting bookings, it locks the relevant documents for that room. If a second transaction tries to perform the same check while the first transaction is still in progress, it will wait until the first transaction is either committed or rolled back. Once the first transaction completes, the second transaction will proceed. If the first transaction booked the room, the second transaction will detect the conflict during the check and throw an error.

Example Scenario:
Transaction 1: Begins and checks for overlapping bookings. It locks the document(s) related to that room.
Transaction 2: Begins almost simultaneously and attempts to check for overlapping bookings. It finds that the necessary documents are locked, so it waits.
Transaction 1: Finds no conflict, creates a booking, and commits the transaction, releasing the lock.
Transaction 2: Proceeds after the lock is released, re-checks for conflicts, and now finds that a booking exists. It throws an error and rolls back the transaction.

Potential Issue: Deadlocks
In some rare cases, two transactions might end up waiting on each other, leading to a deadlock. MongoDB handles deadlocks by automatically aborting one of the transactions, allowing the other to proceed.

# Concepts Used to handle load while reading room info from db(Server Side Pagination)
Server-side pagination helps in managing large datasets efficiently by sending only a subset of data per request.
Implementation: The server calculates the total number of documents, retrieves only the relevant subset based on the page number and page size, and returns the paginated data along with metadata like total pages and current page number.
Benefits: Reduces data transfer size, improves performance, and provides a smoother user experience by only loading a portion of data at a time.