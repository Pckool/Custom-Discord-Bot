import sqlite3, {verbose} from 'sqlite3'
const sql = verbose()
const db = new sql.Database(':memory:')

// db.serialize(() => {
// 	db.run('CREATE TABLE comet_')
// })
// db.close()