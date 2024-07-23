import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

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

async function add(board, loggedinUser) {
    try {
        const defaultBoard = {
            title: '',
            isStarred: false,
            archivedAt: null,
            createdBy: loggedinUser,
            style: {
                backgroundImage: 'https://images.unsplash.com/photo-1480497490787-505ec076689f?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            },
            labels: [
                {
                    id: utilService.makeId(),
                    title: '',
                    color: '#216E4E'
                },
                {
                    id: utilService.makeId(),
                    title: '',
                    color: '#7F5F01'
                },
                {
                    id: utilService.makeId(),
                    title: '',
                    color: '#A54800'
                },
                {
                    id: utilService.makeId(),
                    title: '',
                    color: '#AE2E24'
                },
                {
                    id: utilService.makeId(),
                    title: '',
                    color: '#5E4DB2'
                },
                {
                    id: utilService.makeId(),
                    title: '',
                    color: '#0055CC'
                }
            ],
            members: [loggedinUser],
            groups: [],
            activities: [{
                id: utilService.makeId(),
                title: 'created this board',
                byMember: loggedinUser,
                createdAt: Date.now(),
                task: {},
                group: {}
            }],
        }

        const boardWithDefaults = { ...defaultBoard, ...board };

        const collection = await dbService.getCollection('board')
        await collection.insertOne(boardWithDefaults)
        return boardWithDefaults
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        const collection = await dbService.getCollection('board')
        const originalBoard = await collection.findOne({ _id: ObjectId.createFromHexString(board._id) })
        
        if (!originalBoard) {
            throw new Error(`Board with id ${board._id} not found`);
        }

        const updatedBoard = { ...originalBoard, ...board };
        delete updatedBoard._id;
        await collection.updateOne({ _id: ObjectId.createFromHexString(board._id) }, { $set: updatedBoard })
        return board
    } catch (err) {
        logger.error(`cannot update board:`, err)
        throw err
    }
}