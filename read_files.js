import fs from 'fs';

        const filesToRead = [
            'src/types/entry.ts',
            'src/components/EntryForm/EntryForm.tsx',
            'src/components/DateDetail/DateDetailSheet.tsx',
            'src/components/Export/ExportDialog.tsx',
            'src/lib/exportUtils.ts',
            'src/lib/recurrence.ts',
            'src/hooks/useEntries.ts'
        ];

        filesToRead.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    console.log(`\n--- ${file} ---\n`);
                    console.log(fs.readFileSync(file, 'utf-8'));
                } else {
                    console.log(`\n--- ${file} (NOT FOUND) ---\n`);
                }
            } catch (e) {
                console.error(`Error reading ${file}:`, e);
            }
        });
