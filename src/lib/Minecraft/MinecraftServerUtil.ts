import * as net from "net";
import { promises as dnsPromises } from "dns";
import { MinecraftServerStatusResponse } from "../Interfaces/Common/MinecraftServer";

// VarInt - Variable length integer
// Encoding integers with variable number of bytes

export class MinecraftServerUtil {

    public static async getStatus(host: string, port = 25565): Promise<MinecraftServerStatusResponse> {
        let connectHost = host;
        let connectPort = port;

        try {
            const addresses = await dnsPromises.resolveSrv(`_minecraft._tcp.${host}`);
            if (addresses.length > 0) {
                connectHost = addresses[0].name;
                connectPort = addresses[0].port;
            }
        } catch (e) {
            // SRV lookup failed, proceed with original host/port
        }

        return this.connectAndGetStatus(connectHost, connectPort);
    }

    private static connectAndGetStatus(host: string, port: number): Promise<MinecraftServerStatusResponse> {
        return new Promise((resolve, reject) => {
            let resolved = false;

            const socket = net.createConnection({ host, port, timeout: 5000 }, () => {
                const handshakePacket = this.createHandshakePacket(host, port);
                socket.write(handshakePacket);

                const requestPacket = this.createRequestPacket();
                socket.write(requestPacket);
            });

            let buffer = Buffer.alloc(0);

            const processBuffer = () => {
                if (resolved) return;

                try {
                    const [packetLength, packetLengthBytes] = MinecraftServerUtil.readVarInt(buffer, 0);
                    const totalPacketLength = packetLength + packetLengthBytes;

                    if (buffer.length >= totalPacketLength) {
                        const packetWithoutLength = buffer.slice(packetLengthBytes, totalPacketLength);
                        buffer = buffer.slice(totalPacketLength);

                        const [packetId, packetIdBytes] = MinecraftServerUtil.readVarInt(packetWithoutLength, 0);

                        if (packetId === 0x00) { 
                            // Status Response
                            const [jsonLength, jsonLengthBytes] = MinecraftServerUtil.readVarInt(packetWithoutLength, packetIdBytes);
                            const jsonString = packetWithoutLength.toString("utf8", packetIdBytes + jsonLengthBytes, packetIdBytes + jsonLengthBytes + jsonLength);
                            const status = JSON.parse(jsonString);

                            resolved = true;
                            resolve(status);
                            socket.end();
                        }
                    }
                } catch (e) {
                    if (e instanceof Error && e.message.includes("Buffer underflow")) {
                        // Not enough data to read 
                        return; 
                    }
                    if (!resolved) {
                        resolved = true;
                        reject(e);
                        socket.destroy();
                    }
                }

                if (buffer.length > 0) {
                    processBuffer();
                }
            };

            socket.on("data", (data) => {
                if (!Buffer.isBuffer(data)) return;
                buffer = Buffer.concat([buffer, data]);
                processBuffer();
            });

            socket.on("error", (err) => {
                if (!resolved) {
                    resolved = true;
                    reject(err);
                }
            });

            socket.on("end", () => {
                if (!resolved) {
                    resolved = true;
                    reject(new Error("Connection closed before response was received."));
                }
            });

            socket.on("timeout", () => {
                if (!resolved) {
                    resolved = true;
                    socket.destroy(new Error("Timeout"));
                }
            });
        });
    }

    private static createHandshakePacket(host: string, port: number): Buffer {
        const protocolVersion = MinecraftServerUtil.writeVarInt(754);
        const hostBuffer = Buffer.from(host, "utf8");
        const hostLength = MinecraftServerUtil.writeVarInt(hostBuffer.length);
        const portBuffer = Buffer.alloc(2);
        portBuffer.writeUInt16BE(port, 0);
        const nextState = MinecraftServerUtil.writeVarInt(1);
        const packetId = MinecraftServerUtil.writeVarInt(0x00);

        const data = Buffer.concat([packetId, protocolVersion, hostLength, hostBuffer, portBuffer, nextState]);
        const length = MinecraftServerUtil.writeVarInt(data.length);

        return Buffer.concat([length, data]);
    }

    private static createRequestPacket(): Buffer {
        const packetId = MinecraftServerUtil.writeVarInt(0x00);
        const length = MinecraftServerUtil.writeVarInt(packetId.length);
        return Buffer.concat([length, packetId]);
    }

    private static readVarInt(buffer: Buffer, offset: number): [number, number] {
        let result = 0;
        let shift = 0;
        let cursor = offset;
        while (true) {
            if (cursor >= buffer.length) {
                throw new Error("Buffer underflow reading VarInt");
            }
            const byte = buffer.readUInt8(cursor++);
            result |= (byte & 0x7F) << shift;
            if ((byte & 0x80) === 0) {
                return [result, cursor - offset];
            }
            shift += 7;
            if (shift >= 32) {
                throw new Error("VarInt is too big");
            }
        }
    }

    private static writeVarInt(value: number): Buffer {
        const bytes = [];
        while ((value & 0xFFFFFF80) !== 0) {
            bytes.push((value & 0x7F) | 0x80);
            value >>>= 7;
        }
        bytes.push(value & 0x7F);
        return Buffer.from(bytes);
    }
}
