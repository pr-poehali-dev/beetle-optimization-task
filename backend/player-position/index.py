import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Save and load player position in game
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict with player position
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Player-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    headers = event.get('headers', {})
    player_id = headers.get('x-player-id') or headers.get('X-Player-Id', 'default_player')
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute(
            "SELECT x, y, z, yaw, pitch FROM player_positions WHERE player_id = %s ORDER BY updated_at DESC LIMIT 1",
            (player_id,)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if row:
            position = {
                'x': row[0],
                'y': row[1],
                'z': row[2],
                'yaw': row[3],
                'pitch': row[4]
            }
        else:
            position = {'x': 0, 'y': 2.2, 'z': 0, 'yaw': 0, 'pitch': 0}
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps(position)
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        x = float(body_data.get('x', 0))
        y = float(body_data.get('y', 2.2))
        z = float(body_data.get('z', 0))
        yaw = float(body_data.get('yaw', 0))
        pitch = float(body_data.get('pitch', 0))
        
        cur.execute(
            "INSERT INTO player_positions (player_id, x, y, z, yaw, pitch, updated_at) VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)",
            (player_id, x, y, z, yaw, pitch)
        )
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'position': {'x': x, 'y': y, 'z': z, 'yaw': yaw, 'pitch': pitch}})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }
