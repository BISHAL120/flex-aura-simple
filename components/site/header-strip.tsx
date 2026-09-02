import { HeadsetIcon, RotateCcwIcon, TruckIcon } from 'lucide-react'
import { Container } from './container'

const HeaderStrip = () => {
    return (
        <div>{/* Utility bar */}
            <div className="hidden border-b bg-muted/40 md:block">
                <Container className="flex h-8 items-center justify-between text-xs text-muted-foreground">
                    <p className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1">
                            <TruckIcon className="size-3.5" /> Free shipping over $50
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <RotateCcwIcon className="size-3.5" /> 2mm laser-cut metal
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <HeadsetIcon className="size-3.5" /> Custom sizes available
                        </span>
                    </p>
                    <p>Welcome to Flex Aura</p>
                </Container>
            </div>
        </div>
    )
}

export default HeaderStrip