// Script to validate required environment variables for production deployment
// Run with: node scripts/validate-env.js

const requiredEnvVars = [
  'MONGODB_URI',
  'MONGODB_DB',
  'JWT_SECRET',
  'NEXT_PUBLIC_API_URL',
  'NODE_ENV'
];

const optionalEnvVars = [
  'FLW_PUBLIC_KEY',
  'FLW_SECRET_KEY',
  'FLW_ENCRYPTION_KEY',
  'FLW_CLIENT_ID',
  'FLW_CLIENT_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

console.log('🔍 Validating Environment Variables...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('✅ Required Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`   ❌ ${varName}: MISSING`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const displayValue = varName.includes('SECRET') || varName.includes('URI') 
      ? '***' + value.slice(-4)
      : value.length > 20 
        ? value.slice(0, 20) + '...'
        : value;
    console.log(`   ✓ ${varName}: ${displayValue}`);
    
    // Additional validation
    if (varName === 'JWT_SECRET' && value.length < 32) {
      console.log(`   ⚠️  WARNING: JWT_SECRET should be at least 32 characters (current: ${value.length})`);
      hasWarnings = true;
    }
    
    if (varName === 'MONGODB_URI' && !value.startsWith('mongodb')) {
      console.log(`   ⚠️  WARNING: MONGODB_URI should start with 'mongodb://' or 'mongodb+srv://'`);
      hasWarnings = true;
    }
    
    if (varName === 'NODE_ENV' && value !== 'production' && value !== 'development') {
      console.log(`   ⚠️  WARNING: NODE_ENV should be 'production' or 'development' (current: ${value})`);
      hasWarnings = true;
    }
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');
const missingOptional = [];
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missingOptional.push(varName);
  } else {
    const displayValue = varName.includes('SECRET') || varName.includes('KEY') || varName.includes('PASSWORD')
      ? '***' + value.slice(-4)
      : value.length > 20 
        ? value.slice(0, 20) + '...'
        : value;
    console.log(`   ✓ ${varName}: ${displayValue}`);
  }
});

if (missingOptional.length > 0) {
  console.log(`   ℹ️  Not configured: ${missingOptional.join(', ')}`);
  console.log('   (These are optional - only needed if using those features)');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ VALIDATION FAILED');
  console.log('   Missing required environment variables.');
  console.log('   Please set them before deploying to production.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
  console.log('   All required variables are set, but some have issues.');
  console.log('   Please review the warnings above.');
  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('   All required environment variables are properly configured.');
  process.exit(0);
}
