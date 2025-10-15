/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "+254712345678"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               role:
 *                 type: string
 *                 enum: [customer, technician, corporate, support]
 *                 example: customer
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [36.817223, -1.286389]
 *                   address:
 *                     type: string
 *                     example: "123 Main St, Nairobi"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (with filters)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, technician, admin, corporate, support]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, bio, skills
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for geospatial search
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for geospatial search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/v1/users/nearby-technicians:
 *   get:
 *     summary: Find nearby technicians
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Comma-separated skills (e.g., plumbing,electrical)
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating filter
 *     responses:
 *       200:
 *         description: List of nearby technicians
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 technicians:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get single user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *         description: Filter by service type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceType
 *               - description
 *               - scheduledDate
 *               - serviceLocation
 *             properties:
 *               serviceType:
 *                 type: string
 *                 example: plumbing
 *               description:
 *                 type: string
 *                 example: Fix leaking pipe in kitchen
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-15T10:00:00Z"
 *               serviceLocation:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [36.817223, -1.286389]
 *                   address:
 *                     type: string
 *                     example: "123 Main St, Nairobi"
 *               technician:
 *                 type: string
 *                 description: Technician ID (optional)
 *               urgency:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/support/tickets:
 *   get:
 *     summary: Get all support tickets
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of support tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupportTicket'
 *   post:
 *     summary: Create a support ticket
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *               - category
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Cannot complete payment
 *               description:
 *                 type: string
 *                 example: Getting error when trying to pay for booking
 *               category:
 *                 type: string
 *                 enum: [account, booking, payment, technical, billing, complaint, feature_request, bug_report, general, other]
 *                 example: payment
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *               relatedBooking:
 *                 type: string
 *                 description: Related booking ID
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ticket:
 *                   $ref: '#/components/schemas/SupportTicket'
 */

/**
 * @swagger
 * /api/v1/support/dashboard:
 *   get:
 *     summary: Get support agent dashboard
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     assignedTickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SupportTicket'
 *                     unassignedTickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SupportTicket'
 *                     urgentTickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SupportTicket'
 *                     currentWorkload:
 *                       type: integer
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Get all posts (feed)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [text, image, video, portfolio, tip, question]
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: hashtag
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [text, image, video, portfolio, tip, question]
 *               caption:
 *                 type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 */

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking
 *               - reviewee
 *               - rating
 *               - title
 *               - comment
 *             properties:
 *               booking:
 *                 type: string
 *               reviewee:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               title:
 *                 type: string
 *                 example: Excellent service!
 *               comment:
 *                 type: string
 *                 example: The technician was professional and fixed the issue quickly.
 *               detailedRatings:
 *                 type: object
 *                 properties:
 *                   quality:
 *                     type: number
 *                   timeliness:
 *                     type: number
 *                   professionalism:
 *                     type: number
 *                   communication:
 *                     type: number
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 */

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking
 *               - amount
 *               - gateway
 *             properties:
 *               booking:
 *                 type: string
 *               amount:
 *                 type: number
 *                 example: 5000
 *               gateway:
 *                 type: string
 *                 enum: [mpesa, stripe, cash, wallet]
 *                 example: mpesa
 *               type:
 *                 type: string
 *                 default: booking_payment
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 */

/**
 * @swagger
 * /api/v1/conversations:
 *   get:
 *     summary: Get all conversations for current user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [direct, group, support, booking]
 *                       participants:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/User'
 *                       lastMessage:
 *                         type: object
 *                       unreadCount:
 *                         type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Create or get a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participants
 *               - type
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs
 *               type:
 *                 type: string
 *                 enum: [direct, group, support, booking]
 *                 default: direct
 *               title:
 *                 type: string
 *                 description: Conversation title (required for group chats)
 *     responses:
 *       200:
 *         description: Conversation created or retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/conversations/{id}:
 *   get:
 *     summary: Get a single conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   type: object
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update conversation settings
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               avatar:
 *                 type: object
 *     responses:
 *       200:
 *         description: Conversation updated
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/v1/messages:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversation
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: Message ID to fetch messages before
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       conversation:
 *                         type: string
 *                       sender:
 *                         $ref: '#/components/schemas/User'
 *                       type:
 *                         type: string
 *                         enum: [text, image, video, audio, document, location, booking, voice_call, video_call]
 *                       content:
 *                         type: string
 *                       media:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversation
 *               - type
 *             properties:
 *               conversation:
 *                 type: string
 *                 description: Conversation ID
 *               type:
 *                 type: string
 *                 enum: [text, image, video, audio, document, location, booking, voice_call, video_call]
 *                 default: text
 *               content:
 *                 type: string
 *                 description: Message content (required for text messages)
 *               media:
 *                 type: object
 *                 description: Media content for non-text messages
 *                 properties:
 *                   url:
 *                     type: string
 *                   publicId:
 *                     type: string
 *                   mimeType:
 *                     type: string
 *                   size:
 *                     type: number
 *               replyTo:
 *                 type: string
 *                 description: Message ID being replied to
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/messages/mark-read:
 *   put:
 *     summary: Mark messages as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversation
 *             properties:
 *               conversation:
 *                 type: string
 *                 description: Conversation ID
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific message IDs to mark as read (optional, marks all if not provided)
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   delete:
 *     summary: Delete a message for yourself only
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted for you
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/messages/{id}/everyone:
 *   delete:
 *     summary: Delete a message for everyone (sender only, within 1 hour)
 *     description: Allows message sender to delete a message for all participants. Only works within 1 hour of sending.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted for everyone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Not authorized or time limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Messages can only be deleted for everyone within 1 hour of sending"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/messages/{id}/reaction:
 *   post:
 *     summary: Add reaction to a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *                 example: "👍"
 *     responses:
 *       200:
 *         description: Reaction added
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get all notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [booking, payment, social, message, system, achievement]
 *         description: Filter by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       recipient:
 *                         type: string
 *                       sender:
 *                         $ref: '#/components/schemas/User'
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       category:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Get a single notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [booking, payment, social, message, system, achievement]
 *         description: Optional - only mark notifications of this category as read
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/notifications/clear-read:
 *   delete:
 *     summary: Clear all read notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Read notifications cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   get:
 *     summary: Get notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User notification preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     push:
 *                       type: boolean
 *                     email:
 *                       type: boolean
 *                     sms:
 *                       type: boolean
 *                     categories:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Update notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               push:
 *                 type: boolean
 *               email:
 *                 type: boolean
 *               sms:
 *                 type: boolean
 *               categories:
 *                 type: object
 *                 properties:
 *                   booking:
 *                     type: boolean
 *                   payment:
 *                     type: boolean
 *                   social:
 *                     type: boolean
 *                   message:
 *                     type: boolean
 *                   system:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/matching/find-technicians:
 *   post:
 *     summary: Find smart-matched technicians for a service request
 *     description: Uses intelligent algorithms to match customers with the best technicians based on skills, location, availability, ratings, and preferences
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceCategory
 *               - location
 *             properties:
 *               serviceCategory:
 *                 type: string
 *                 enum: [plumbing, electrical, carpentry, painting, cleaning, appliance_repair, hvac, locksmith, landscaping, roofing, flooring, masonry, welding, pest_control, general_handyman, other]
 *                 example: plumbing
 *               location:
 *                 type: object
 *                 required:
 *                   - coordinates
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *                     description: [longitude, latitude]
 *                     example: [36.817223, -1.286389]
 *                   address:
 *                     type: string
 *                     example: "123 Main St, Nairobi"
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high, emergency]
 *                 default: medium
 *               budget:
 *                 type: number
 *                 example: 5000
 *                 description: Budget in local currency
 *               preferredDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-15T10:00:00Z"
 *               description:
 *                 type: string
 *                 example: "Leaking kitchen sink needs urgent repair"
 *     responses:
 *       200:
 *         description: Matched technicians found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       technician:
 *                         $ref: '#/components/schemas/User'
 *                       scores:
 *                         type: object
 *                         properties:
 *                           overall:
 *                             type: number
 *                             example: 87.5
 *                           skillMatch:
 *                             type: number
 *                           locationProximity:
 *                             type: number
 *                           availability:
 *                             type: number
 *                           rating:
 *                             type: number
 *                       distance:
 *                         type: number
 *                         example: 3.2
 *                         description: Distance in kilometers
 *                       matchReasons:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             reason:
 *                               type: string
 *                             weight:
 *                               type: number
 *                             score:
 *                               type: number
 *                 sessionId:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/matching/my-matches:
 *   get:
 *     summary: Get user's active matches
 *     description: Retrieve all active smart-matched results for the current user
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceCategory
 *         schema:
 *           type: string
 *         description: Filter by service category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [suggested, viewed, contacted, accepted, rejected, expired]
 *         description: Filter by match status
 *     responses:
 *       200:
 *         description: List of active matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/matching/{id}:
 *   get:
 *     summary: Get matching details
 *     description: Get detailed information about a specific match
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Matching ID
 *     responses:
 *       200:
 *         description: Matching details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/v1/matching/{id}/accept:
 *   post:
 *     summary: Accept a match and create booking
 *     description: Accept a smart-matched recommendation and automatically create a booking with the matched technician
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Matching ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduledDate
 *               - scheduledTime
 *             properties:
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-10-15"
 *               scheduledTime:
 *                 type: string
 *                 pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                 example: "14:30"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Fix leaking pipe in kitchen"
 *               estimatedDuration:
 *                 type: number
 *                 example: 2
 *                 description: Estimated duration in hours
 *     responses:
 *       201:
 *         description: Match accepted and booking created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     matching:
 *                       type: object
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/matching/{id}/reject:
 *   post:
 *     summary: Reject a match
 *     description: Reject a smart-matched recommendation (helps improve future recommendations)
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Matching ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Too far from my location"
 *     responses:
 *       200:
 *         description: Match rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/v1/matching/{id}/feedback:
 *   post:
 *     summary: Add feedback to a match
 *     description: Provide feedback on match quality to improve AI recommendations
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Matching ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               helpful:
 *                 type: boolean
 *                 example: true
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               accuracy:
 *                 type: string
 *                 enum: [accurate, partially_accurate, inaccurate]
 *                 example: accurate
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Great match! Exactly what I was looking for."
 *     responses:
 *       200:
 *         description: Feedback added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/v1/matching/preferences:
 *   get:
 *     summary: Get user matching preferences
 *     description: Retrieve current user's AI matching preferences
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     general:
 *                       type: object
 *                       properties:
 *                         maxDistance:
 *                           type: number
 *                           example: 25
 *                         priceRange:
 *                           type: object
 *                         responseTime:
 *                           type: string
 *                     technicianPreferences:
 *                       type: object
 *                     scheduling:
 *                       type: object
 *                     ai:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Update user matching preferences
 *     description: Update AI matching preferences to improve future recommendations
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               general:
 *                 type: object
 *                 properties:
 *                   maxDistance:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 100
 *                     example: 25
 *                   priceRange:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                       max:
 *                         type: number
 *                       preference:
 *                         type: string
 *                         enum: [budget, moderate, premium, any]
 *               technicianPreferences:
 *                 type: object
 *                 properties:
 *                   minRating:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 5
 *                     example: 4.0
 *                   experienceLevel:
 *                     type: string
 *                     enum: [any, beginner, intermediate, advanced, expert]
 *                   requireCertifications:
 *                     type: boolean
 *                   requireBackgroundCheck:
 *                     type: boolean
 *               ai:
 *                 type: object
 *                 properties:
 *                   enableAIRecommendations:
 *                     type: boolean
 *                   autoMatch:
 *                     type: boolean
 *                   personalizationLevel:
 *                     type: string
 *                     enum: [minimal, moderate, high]
 *               customWeights:
 *                 type: object
 *                 description: Custom weights for matching algorithm (must sum to 100)
 *                 properties:
 *                   skillMatch:
 *                     type: number
 *                   locationProximity:
 *                     type: number
 *                   availability:
 *                     type: number
 *                   rating:
 *                     type: number
 *     responses:
 *       200:
 *         description: Preferences updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/v1/matching/block/{technicianId}:
 *   post:
 *     summary: Block a technician from future matches
 *     description: Prevent a specific technician from appearing in future AI matches
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: string
 *         description: Technician user ID to block
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Poor communication in previous interactions"
 *     responses:
 *       200:
 *         description: Technician blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     summary: Unblock a technician
 *     description: Remove a technician from the blocked list
 *     tags: [Smart Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: string
 *         description: Technician user ID to unblock
 *     responses:
 *       200:
 *         description: Technician unblocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

module.exports = {};
