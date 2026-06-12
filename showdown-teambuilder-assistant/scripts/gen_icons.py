"""Genera iconos PNG simples (sin dependencias) para la extension.
Dibuja un cuadrado redondeado azul con una pokeball estilizada simple.
Solo se usa una vez para crear los assets iniciales en icons/.
"""
import struct
import zlib
import os

def make_png(size, path):
    bg = (47, 99, 196, 255)       # azul
    fg = (255, 255, 255, 255)     # blanco
    accent = (230, 60, 60, 255)   # rojo (pokeball)

    pixels = bytearray()
    cx = cy = size / 2
    r_outer = size * 0.46
    r_band = size * 0.06
    r_center = size * 0.12
    r_center_ring = size * 0.16

    for y in range(size):
        row = bytearray()
        for x in range(size):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            dist = (dx * dx + dy * dy) ** 0.5
            if dist > r_outer:
                px = (0, 0, 0, 0)  # transparente fuera del circulo
            elif abs(dy) < r_band and dist > r_center_ring:
                px = (40, 40, 40, 255)  # banda central de la pokeball
            elif dist <= r_center_ring and dist > r_center:
                px = fg  # anillo blanco
            elif dist <= r_center:
                px = (40, 40, 40, 255)  # boton central
            elif dy < 0:
                px = accent  # mitad superior roja
            else:
                px = fg  # mitad inferior blanca
            row.extend(px)
        pixels.extend(b'\x00' + bytes(row))  # filtro 0 = none

    raw = bytes(pixels)
    compressed = zlib.compress(raw, 9)

    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    with open(path, 'wb') as f:
        f.write(sig)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))


if __name__ == '__main__':
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'icons')
    for size, name in [(16, 'icon16.png'), (48, 'icon48.png'), (128, 'icon128.png')]:
        make_png(size, os.path.join(out_dir, name))
        print('wrote', name)
