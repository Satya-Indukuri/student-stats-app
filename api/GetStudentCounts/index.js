const { Connection } = require('tedious');

module.exports = async function (context, req) {
    const config = {
        server: process.env.SQL_SERVER, 
        authentication: {
            type: 'default',
            options: {
                userName: process.env.SQL_USER,
                password: process.env.SQL_PASSWORD
            }
        },
        options: {
            database: process.env.SQL_DATABASE,
            encrypt: true,
            rowCollectionOnDone: true
        }
    };

    return new Promise((resolve, reject) => {
        const connection = new Connection(config);
        connection.on('connect', err => {
            if (err) {
                context.log.error(err);
                context.res = { status: 500, body: "Connection Error" };
                resolve();
            } else {
                const Request = require('tedious').Request;
                const query = 'SELECT Country, COUNT(*) AS StudentCount FROM dbo.Students GROUP BY Country';
                const request = new Request(query, (err, rowCount, rows) => {
                    if (err) {
                        context.res = { status: 500, body: err };
                    } else {
                        const result = rows.map(row => ({
                            Country: row[0].value,
                            StudentCount: row[1].value
                        }));
                        context.res = { status: 200, body: result };
                    }
                    connection.close();
                    resolve();
                });
                connection.execSql(request);
            }
        });
        connection.connect();
    });
};
