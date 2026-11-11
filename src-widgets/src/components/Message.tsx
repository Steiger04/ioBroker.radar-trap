import type React from 'react';
import { Box, Typography } from '@mui/material';

/** A hint in the middle of the widget */
export function Message({ message }: { message: string }): React.JSX.Element {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                textAlign: 'center',
            }}
        >
            <Typography
                variant="body2"
                component="p"
            >
                {message}
            </Typography>
        </Box>
    );
}
