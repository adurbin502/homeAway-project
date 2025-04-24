const { sequelize } = require('./models');

async function createSchema() {
    console.log('Starting schema creation...');
    console.log('Schema name:', process.env.SCHEMA);
    
    try {
        // Create the schema if it doesn't exist
        await sequelize.createSchema(process.env.SCHEMA, { ifNotExists: true });
        console.log('Schema created successfully');
        await sequelize.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error creating schema:', error);
        await sequelize.close();
        throw error;
    }
}

// Export the function and execute it immediately
module.exports = createSchema;

// Execute the function when the file is run directly
if (require.main === module) {
    console.log('Initializing schema creation script...');
    createSchema()
        .then(() => {
            console.log('Schema creation completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Schema creation failed:', error);
            process.exit(1);
        });
}