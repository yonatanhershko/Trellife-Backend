import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getBoards, getBoardById, addBoard, updateBoard, removeBoard } from './board.controller.js'

export const boardRoutes = express.Router()

// middleware that is specific to this router
boardRoutes.use(requireAuth)

boardRoutes.get('/', log, getBoards)
boardRoutes.get('/:id', getBoardById)
boardRoutes.post('/', log, addBoard)
boardRoutes.put('/:id', updateBoard)
// boardRoutes.post('/', log, requireAuth, addBoard)
// boardRoutes.put('/:id', requireAuth, updateBoard)
boardRoutes.delete('/:id', removeBoard)
// router.delete('/:id', requireAuth, requireAdmin, removeBoard)