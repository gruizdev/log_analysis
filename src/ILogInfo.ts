export default interface ILogInfo {
    host: string;
    datetime: {
        day: string;
        hour: string;
        minute: string;
        second: string;
    };
    request: {
        method: string;
        url: string;
        protocol: string;
        protocol_version: string;    
    }
    response_code: string;
    document_size: number;
}