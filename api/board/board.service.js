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

        let pipeline = [
            { $match: criteria },
        ]

        if (sortBy.field === 'activity') {
            pipeline.push(
                {
                    $addFields: {
                        lastActivityDate: {
                            $ifNull: [
                                { $arrayElemAt: ["$activities.createdAt", -1] },
                                new Date(0)  // Default date if activities array is empty
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        lastActivityDate: sortBy.dir === 1 ? 1 : -1
                    }
                }
            )
        } else if (sortBy.field === 'alphabet') {
            pipeline.push(
                {
                    $addFields: {
                        lowercaseTitle: { $toLower: "$title" }
                    }
                },
                {
                    $sort: {
                        lowercaseTitle: sortBy.dir === 1 ? 1 : -1
                    }
                },
                {
                    $project: {
                        lowercaseTitle: 0  // Remove the temporary field
                    }
                }
            )
        }

        let boards = await collection.aggregate(pipeline).toArray()
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
            title: board.title,
            isStarred: false,
            archivedAt: null,
            style: board.style,
            createdBy: loggedinUser,
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
                title: 'create board',
                byMember: loggedinUser,
                createdAt: Date.now(),
                task: {},
                group: {}
            }],
        }

        console.log(defaultBoard)

        const collection = await dbService.getCollection('board')
        await collection.insertOne(defaultBoard)
        return defaultBoard
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        console.log(board)

        const collection = await dbService.getCollection('board')
        const originalBoard = await collection.findOne({ _id: ObjectId.createFromHexString(board._id) })

        if (!originalBoard) {
            throw new Error(`Board with id ${board._id} not found`);
        }

        const updatedBoard = { ...originalBoard, ...board };
        delete updatedBoard._id;
        await collection.updateOne({ _id: ObjectId.createFromHexString(board._id) }, { $set: updatedBoard })
        console.log(board)
        return board
    } catch (err) {
        logger.error(`cannot update board:`, err)
        throw err
    }
}