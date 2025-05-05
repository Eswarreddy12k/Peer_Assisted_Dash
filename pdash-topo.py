
from mininet.topo import Topo

class PDASHTopo(Topo):
    def build(self):
        # Create core switches (mesh backbone)
        core = [self.addSwitch(f's{i}') for i in range(1, 8)]

        # Connect switches in a mesh-like pattern (manually for control)
        self.addLink(core[0], core[1])
        self.addLink(core[0], core[2])
        self.addLink(core[0], core[3])
        self.addLink(core[1], core[4])
        self.addLink(core[2], core[4])
        self.addLink(core[3], core[5])
        self.addLink(core[4], core[6])
        self.addLink(core[5], core[6])
        self.addLink(core[1], core[3])  # extra links for full mesh
        self.addLink(core[2], core[5])

        # Add CDN and Tracker to one of the core switches (s7)
        cdn = self.addHost('cdn', ip='10.0.0.1')
        tracker = self.addHost('tracker', ip='10.0.0.2')
        self.addLink(cdn, core[6])
        self.addLink(tracker, core[6])

        # Add peers to each switch (6 peers per switch × 6 switches)
        host_id = 3
        for i, sw in enumerate(core[:6]):
            for j in range(6):  # 6 peers per switch
                hname = f'h{host_id}'
                hip = f'10.0.{i+1}.{j+1}'  # subnet 10.0.i.x
                host = self.addHost(hname, ip=hip)
                self.addLink(host, sw)
                host_id += 1

topos = { 'pdash': PDASHTopo }
