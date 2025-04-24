const { sequelize } = require('./models');

async function createSchema() {
    console.log('Starting schema creation...');
    console.log('Schema name:', process.env.SCHEMA);

    try {
        // Try to create the schema
        await sequelize.createSchema(process.env.SCHEMA, { ifNotExists: true });
        console.log('Schema created successfully');
    } catch (error) {
        // If the error is "schema already exists", we can continue
        if (error.parent?.code === '42P06') {
            console.log('Schema already exists, continuing...');
        } else {
            // For other errors, we should still throw
            console.error('Error creating schema:', error);
            throw error;
        }
    } finally {
        await sequelize.close();
        console.log('Database connection closed');
    }
}

// Export the function and execute it immediately
module.exports = createSchema;

// Execute the function when the file is run directly
if (require.main === module) {
    console.log('Initializing schema creation script...');
    createSchema()
        .then(() => {
            console.log('Schema creation process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Schema creation process failed:', error);
            process.exit(1);
        });
}