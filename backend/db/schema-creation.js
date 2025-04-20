const { sequelize } = require('./models');

async function createSchema() {
    try {
        // Create the schema if it doesn't exist
        await sequelize.createSchema(process.env.SCHEMA, { ifNotExists: true });
        console.log('Schema created successfully');
    } catch (error) {
        console.error('Error creating schema:', error);
        throw error;
    }
}

module.exports = createSchema;