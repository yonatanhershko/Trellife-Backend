import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

export const boardService = {
    query,
    getById,
    remove,
    add,
    update,
}

async function query(filterBy = {}, sortBy = {}) {
    try {
        const criteria = {}
        if (filterBy.title) {
            criteria.title = { $regex: filterBy.title, $options: 'i' }
        }

        const collection = await dbService.getCollection('board')

        let boards = await collection.find(criteria)

        // Understand recent active logic and implement for sorting

        // if (sortBy.field === 'recentlyActive') {
        //     boards = await boards.sort({ name: sortBy.dir === 1 ? 1 : -1 })
        // } else 
        if (sortBy.field === 'alphabet') {
            boards = await boards.sort({ title: sortBy.dir === 1 ? 1 : -1 })
        }

        boards = await boards.toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = await collection.findOne({ _id: ObjectId.createFromHexString(boardId) })
        board.createdAt = board._id.getTimestamp()
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(boardId) })
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.insertOne(board)
        return board
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        const boardToUpdate = board
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: ObjectId.createFromHexString(board._id) }, { $set: boardToUpdate })
        return board
    } catch (err) {
        logger.error(`cannot update board:`, err)
        throw err
    }
}