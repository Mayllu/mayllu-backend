export interface LogMetadata {
    url?: string;
    method?: string;
    duration?: string;
    statusCode?: string;
    [key: string]: any;
}