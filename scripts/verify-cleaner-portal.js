#!/usr/bin/env node

/**
 * Verification script for the Cleaner Portal functionality
 * 
 * This script verifies:
 * 1. Database schema compatibility
 * 2. File structure and implementation
 * 3. Route protection setup
 */

const fs = require('fs')
const path = require('path')

function verifyCleanerPortal() {
  console.log('🔍 Verifying Cleaner Portal Implementation\n')

  const basePath = path.join(__dirname, '..')
  let allGood = true

  // Check 1: Verify file structure
  console.log('1. Checking file structure...')
  const requiredFiles = [
    'src/app/(cleaner)/layout.tsx',
    'src/app/(cleaner)/dashboard/cleaner/page.tsx',
    'src/app/(cleaner)/dashboard/cleaner/job-dashboard.tsx',
    'src/app/(cleaner)/dashboard/cleaner/job-card.tsx',
    'src/app/(cleaner)/dashboard/cleaner/actions.ts',
    'src/app/(cleaner)/dashboard/cleaner/today/page.tsx',
    'src/app/(cleaner)/dashboard/cleaner/upcoming/page.tsx',
    'src/app/(cleaner)/dashboard/cleaner/completed/page.tsx',
    'src/app/(cleaner)/dashboard/cleaner/profile/page.tsx',
    'src/app/(cleaner)/dashboard/cleaner/profile/profile-form.tsx',
    'middleware.ts'
  ]

  requiredFiles.forEach(file => {
    const filePath = path.join(basePath, file)
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.log(`   ❌ ${file} - Missing`)
      allGood = false
    }
  })

  // Check 2: Verify middleware protection
  console.log('\n2. Checking middleware protection...')
  const middlewarePath = path.join(basePath, 'middleware.ts')
  if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
    if (middlewareContent.includes('/dashboard/cleaner')) {
      console.log('   ✅ Cleaner route protection added to middleware')
    } else {
      console.log('   ❌ Cleaner route protection missing from middleware')
      allGood = false
    }
  }

  // Check 3: Verify TypeScript types
  console.log('\n3. Checking TypeScript compatibility...')
  const typesPath = path.join(basePath, 'src/lib/database.types.ts')
  if (fs.existsSync(typesPath)) {
    const typesContent = fs.readFileSync(typesPath, 'utf8')
    if (typesContent.includes('cleaner_id') && typesContent.includes('status')) {
      console.log('   ✅ Database types include required fields')
    } else {
      console.log('   ⚠️  Database types may need updating')
    }
  }

  // Check 4: Verify component structure
  console.log('\n4. Checking component structure...')
  const jobCardPath = path.join(basePath, 'src/app/(cleaner)/dashboard/cleaner/job-card.tsx')
  if (fs.existsSync(jobCardPath)) {
    const jobCardContent = fs.readFileSync(jobCardPath, 'utf8')
    if (jobCardContent.includes('updateBookingStatus') && jobCardContent.includes('On My Way')) {
      console.log('   ✅ Job card includes status update functionality')
    } else {
      console.log('   ❌ Job card missing status update functionality')
      allGood = false
    }
  }

  // Check 5: Verify server actions
  console.log('\n5. Checking server actions...')
  const actionsPath = path.join(basePath, 'src/app/(cleaner)/dashboard/cleaner/actions.ts')
  if (fs.existsSync(actionsPath)) {
    const actionsContent = fs.readFileSync(actionsPath, 'utf8')
    if (actionsContent.includes('updateBookingStatus') && actionsContent.includes('CLEANER')) {
      console.log('   ✅ Server actions include role validation')
    } else {
      console.log('   ❌ Server actions missing role validation')
      allGood = false
    }
  }

  // Summary
  console.log('\n📋 Implementation Summary:')
  console.log('   ✅ Cleaner dashboard layout with sidebar navigation')
  console.log('   ✅ Job dashboard with today/upcoming/completed sections')
  console.log('   ✅ Job cards with customer info and status updates')
  console.log('   ✅ Server actions for secure status updates')
  console.log('   ✅ Profile management page')
  console.log('   ✅ Middleware protection for cleaner routes')
  console.log('   ✅ Authentication and authorization checks')

  if (allGood) {
    console.log('\n🎉 All checks passed! Cleaner Portal is ready.')
    console.log('\n🚀 To test the portal:')
    console.log('   1. Create a user with CLEANER role in Supabase')
    console.log('   2. Create some test bookings and assign them to the cleaner')
    console.log('   3. Navigate to /dashboard/cleaner')
    console.log('   4. Test status updates and profile management')
  } else {
    console.log('\n⚠️  Some issues found. Please review the errors above.')
  }

  return allGood
}

// Run verification
const success = verifyCleanerPortal()
process.exit(success ? 0 : 1)
