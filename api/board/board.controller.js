import { boardService } from './board.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getBoards(req, res) {
    try {
        const filterBy = {
            title: req.query.title || '',
        }
        const sortBy = {
            field: req.query.field || '',
            dir: +req.query.dir || 1
        }
        const boards = await boardService.query(filterBy, sortBy)
        res.json(boards)
    } catch (err) {
        logger.error('Failed to get boards', err)
        res.status(500).send({ err: 'Failed to get boards' })
    }
}

export async function getBoardById(req, res) {
    try {
        const boardId = req.params.id
        const board = await boardService.getById(boardId)
        res.json(board)
    } catch (err) {
        logger.error('Failed to get board', err)
        res.status(500).send({ err: 'Failed to get board' })
    }
}

export async function addBoard(req, res) {
    const { loggedinUser } = req

    try {
        const board = req.body
        const addedBoard = await boardService.add(board, loggedinUser)
        socketService.broadcast({ type: 'board-added', data: addedBoard, userId: loggedinUser._id })
        res.json(addedBoard)
    } catch (err) {
        logger.error('Failed to add board', err)
        res.status(500).send({ err: 'Failed to add board' })
    }
}

export async function updateBoard(req, res) {
    const { loggedinUser } = req
    try {
        const board = req.body
        const updatedBoard = await boardService.update(board)
        socketService.broadcast({ type: 'watched-board-updated', data: updatedBoard, room: updatedBoard._id, userId: loggedinUser._id })
        res.json(updatedBoard)
    } catch (err) {
        logger.error('Failed to update board', err)
        res.status(500).send({ err: 'Failed to update board' })
    }
}

export async function removeBoard(req, res) {
    const { loggedinUser } = req
    try {
        const boardId = req.params.id
        const board = await boardService.getById(boardId)
        if (!board) {
            return res.status(404).send({ err: 'Board not found' })
        }
        if (board.createdBy._id !== loggedinUser._id) {
            return res.status(403).send({ err: 'Access denied. You are not the creator of this board.' })
        }

        const deletedCount = await boardService.remove(boardId)
        res.send(`${deletedCount} board removed`)
    } catch (err) {
        logger.error('Failed to remove board', err)
        res.status(500).send({ err: 'Failed to remove board' })
    }
}