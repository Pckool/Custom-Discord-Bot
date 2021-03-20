export interface ConfigData {
	theatre_data: TheatreData,
	announcement_data: AnnouncementData
}
export interface TheatreData {
	categoryId: string,
	chatId: string,
	voiceId: string
}
export interface AnnouncementData {
	general_id: string,
	event_id: string,
	stream_id: string,
	video_id: string
}